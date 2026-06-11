import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function ForgotPasswordHub() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-white mb-2">Reset Password</h1>
          <p className="text-slate-400 text-xs">
            Enter your email and we&apos;ll send a recovery link.
          </p>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {sent ? (
          <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-6">
            Check your inbox for a password reset link.
          </p>
        ) : (
          <div className="relative mb-6">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        )}

        {!sent && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !email}
            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-lg transition-all"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
            <Send className="w-4 h-4 ml-2" />
          </button>
        )}

        <Link
          to="/login"
          className="mt-6 flex items-center justify-center gap-2 text-slate-500 hover:text-white text-[10px] uppercase font-bold tracking-widest transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
