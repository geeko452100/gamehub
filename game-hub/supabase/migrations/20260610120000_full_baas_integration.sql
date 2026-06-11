-- Full BaaS integration: profile avatars, daily puzzles, storage bucket

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE TABLE IF NOT EXISTS public.daily_puzzles (
  puzzle_date date PRIMARY KEY,
  word text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_puzzles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily puzzles"
  ON public.daily_puzzles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Mirrors client hashDate() in game-hub/src/games/puzzle/gameLogic.js
CREATE OR REPLACE FUNCTION public.puzzle_hash(p_date text)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  hash integer := 0;
  i integer;
  c integer;
BEGIN
  FOR i IN 1..length(p_date) LOOP
    c := ascii(substr(p_date, i, 1));
    hash := (hash * 32) - hash + c;
    hash := (hash::bigint & 4294967295)::integer;
    IF hash >= 2147483648 THEN
      hash := hash - 4294967296;
    END IF;
  END LOOP;
  RETURN abs(hash);
END;
$$;

CREATE OR REPLACE FUNCTION public.puzzle_word_for_date(p_date text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (ARRAY[
    'APPLE','BEACH','CHAIR','DANCE','EAGLE','FLAME','GRAPE','HEART',
    'IMAGE','JOKER','KNIFE','LEMON','MUSIC','NIGHT','OCEAN','PIANO',
    'QUART','RIVER','STORM','TIGER','UNITE','VIVID','WATCH','XENON',
    'YACHT','ZEBRA','BREAD','CLOUD','DREAM','EARTH','FOCUS','GHOST',
    'HAPPY','IVORY','JUMBO','KNEEL','LIGHT','MAGIC','NORTH','OLIVE',
    'PEACE','QUEST','ROBOT','SHINE','TRAIN','URBAN','VOICE','WHEAT',
    'YOUTH','ZONAL','BRAVE','CRANE','DRIFT','ELBOW','FROST','GLOBE',
    'HONEY','INBOX','JAZZY','KAYAK','LUNCH','MELON','NOVEL','OPERA',
    'PLANT','QUILT','RADIO','SCALE','THUMB','ULTRA','VAULT','WHALE',
    'YIELD','ZESTY','BLAZE','CRISP','DODGE','EVERY','FANCY','GAMES',
    'HUMOR','INDEX','JUMPS','KINGS','LOVER','MARCH','NURSE','OZONE',
    'PANEL','QUICK','RANCH','SNAKE','TREND','UNION','VAPOR','WOMAN'
  ])[1 + (public.puzzle_hash(p_date) % 96)];
$$;

CREATE OR REPLACE FUNCTION public.get_daily_puzzle_word(p_puzzle_date text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date date := p_puzzle_date::date;
  v_word text;
BEGIN
  SELECT word INTO v_word
  FROM public.daily_puzzles
  WHERE puzzle_date = v_date;

  IF v_word IS NOT NULL THEN
    RETURN upper(v_word);
  END IF;

  v_word := public.puzzle_word_for_date(p_puzzle_date);

  INSERT INTO public.daily_puzzles (puzzle_date, word)
  VALUES (v_date, v_word)
  ON CONFLICT (puzzle_date) DO UPDATE
    SET word = EXCLUDED.word
  RETURNING word INTO v_word;

  RETURN upper(v_word);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_daily_puzzle_word(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_daily_puzzle_word(text) TO authenticated;

-- Seed today and the next week
INSERT INTO public.daily_puzzles (puzzle_date, word)
SELECT d::date, public.puzzle_word_for_date(to_char(d, 'YYYY-MM-DD'))
FROM generate_series(current_date, current_date + 7, interval '1 day') AS d
ON CONFLICT (puzzle_date) DO NOTHING;

-- Avatar storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
