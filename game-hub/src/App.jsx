import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import SidebarLayout from './components/SidebarLayout';
import CardBattlerEngine from './games/card-battler/CardBattlerEngine';
import Home from './pages/Home';
import AuthHub from './pages/AuthHub';
import RegisterHub from './pages/RegisterHub';
import ForgotPasswordHub from './pages/ForgotPasswordHub';
import ResetPasswordHub from './pages/ResetPasswordHub';
import ProfileHub from './pages/ProfileHub';
import MatchmakingHub from './games/card-battler/MatchmakingHub';
import IdleEngine from './games/idle/IdleEngine';
import PuzzleEngine from './games/puzzle/PuzzleEngine';
import Leaderboard from './pages/Leaderboard';
import { useAuth } from '@/lib/supabase/useAuth';

function MatchmakingWrapper({ userId }) {
  const navigate = useNavigate();
  return (
    <MatchmakingHub
      userId={userId}
      onGameStart={(gameId) => navigate(`/game/play/${gameId}`)}
    />
  );
}

function GameWrapper({ userId }) {
  const { gameId } = useParams();
  return <CardBattlerEngine gameId={gameId} currentUserId={userId} />;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-amber-400 font-bold">
      Loading...
    </div>
  );
}

export default function App() {
  const { session, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={!session ? <AuthHub /> : <Navigate to="/" />} />
      <Route path="/register" element={!session ? <RegisterHub /> : <Navigate to="/" />} />
      <Route path="/forgot-password" element={!session ? <ForgotPasswordHub /> : <Navigate to="/" />} />
      <Route path="/reset-password" element={<ResetPasswordHub />} />

      <Route
        path="/*"
        element={
          session ? (
            <SidebarLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<ProfileHub />} />
                <Route path="/leaderboard" element={<Leaderboard userId={session.user.id} />} />
                <Route path="/game/cards" element={<MatchmakingWrapper userId={session.user.id} />} />
                <Route path="/game/idle" element={<IdleEngine userId={session.user.id} />} />
                <Route path="/game/puzzle" element={<PuzzleEngine userId={session.user.id} />} />
                <Route path="/game/play/:gameId" element={<GameWrapper userId={session.user.id} />} />
              </Routes>
            </SidebarLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}
