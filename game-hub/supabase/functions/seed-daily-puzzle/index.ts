import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.0';

const ANSWER_WORDS = [
  'APPLE', 'BEACH', 'CHAIR', 'DANCE', 'EAGLE', 'FLAME', 'GRAPE', 'HEART',
  'IMAGE', 'JOKER', 'KNIFE', 'LEMON', 'MUSIC', 'NIGHT', 'OCEAN', 'PIANO',
  'QUART', 'RIVER', 'STORM', 'TIGER', 'UNITE', 'VIVID', 'WATCH', 'XENON',
  'YACHT', 'ZEBRA', 'BREAD', 'CLOUD', 'DREAM', 'EARTH', 'FOCUS', 'GHOST',
  'HAPPY', 'IVORY', 'JUMBO', 'KNEEL', 'LIGHT', 'MAGIC', 'NORTH', 'OLIVE',
  'PEACE', 'QUEST', 'ROBOT', 'SHINE', 'TRAIN', 'URBAN', 'VOICE', 'WHEAT',
  'YOUTH', 'ZONAL', 'BRAVE', 'CRANE', 'DRIFT', 'ELBOW', 'FROST', 'GLOBE',
  'HONEY', 'INBOX', 'JAZZY', 'KAYAK', 'LUNCH', 'MELON', 'NOVEL', 'OPERA',
  'PLANT', 'QUILT', 'RADIO', 'SCALE', 'THUMB', 'ULTRA', 'VAULT', 'WHALE',
  'YIELD', 'ZESTY', 'BLAZE', 'CRISP', 'DODGE', 'EVERY', 'FANCY', 'GAMES',
  'HUMOR', 'INDEX', 'JUMPS', 'KINGS', 'LOVER', 'MARCH', 'NURSE', 'OZONE',
  'PANEL', 'QUICK', 'RANCH', 'SNAKE', 'TREND', 'UNION', 'VAPOR', 'WOMAN',
];

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i += 1) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function wordForDate(dateStr: string): string {
  return ANSWER_WORDS[hashDate(dateStr) % ANSWER_WORDS.length];
}

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const daysAhead = Number(new URL(req.url).searchParams.get('days') ?? '14');
  const rows = [];

  for (let offset = 0; offset <= daysAhead; offset += 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + offset);
    const puzzleDate = formatDate(date);
    rows.push({ puzzle_date: puzzleDate, word: wordForDate(puzzleDate) });
  }

  const { error } = await supabase
    .from('daily_puzzles')
    .upsert(rows, { onConflict: 'puzzle_date' });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ seeded: rows.length, dates: rows.map((r) => r.puzzle_date) }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
