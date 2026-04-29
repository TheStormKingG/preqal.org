import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';

// ---------------------------------------------------------------------------
// Google-coloured SVG icon (inline, no extra dep)
// ---------------------------------------------------------------------------
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ECourseRegister: React.FC = () => {
  const { user, profile, loading, signInWithGoogle, upsertProfile } = useAuth();
  const navigate = useNavigate();

  // Name-edit step (shown after OAuth if profile needs setting up)
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  // ── Redirect if already fully registered ──────────────────────────────────
  const ADMIN_EMAILS = ['stefan.gravesande@gmail.com', 'stefan.gravesande@preqal.org'];
  useEffect(() => {
    if (!loading && user && profile) {
      if (ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())) {
        window.location.href = '/admin-dashboard.html';
      } else {
        navigate('/e-courses/learn', { replace: true });
      }
    }
  }, [loading, user, profile, navigate]);

  // ── Pre-fill name from Google metadata when user is ready ─────────────────
  useEffect(() => {
    if (user && !profile) {
      const googleName =
        (user.user_metadata?.full_name as string | undefined) ||
        (user.user_metadata?.name as string | undefined) ||
        '';
      setEditName(googleName);
      setTimeout(() => nameRef.current?.focus(), 60);
    }
  }, [user, profile]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Could not start Google sign-in. Please try again.');
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (!trimmed) {
      setError('Please enter your name as you would like it on the certificate.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await upsertProfile(trimmed);
      if (ADMIN_EMAILS.includes((user?.email ?? '').toLowerCase())) {
        window.location.href = '/admin-dashboard.html';
      } else {
        navigate('/e-courses/learn', { replace: true });
      }
    } catch {
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading spinner ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-label="Loading…" />
      </div>
    );
  }

  // ── Step 2: name confirmation (signed in, no profile yet) ─────────────────
  if (user && !profile) {
    return (
      <>
        <SEO pageKey="eCourseLearn" />
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="neu-card max-w-md w-full rounded-2xl border border-white/60 bg-[#e8ecf2] p-8 shadow-neu space-y-6">
            {/* Avatar */}
            {(user.user_metadata?.avatar_url as string | undefined) ? (
              <img
                src={user.user_metadata.avatar_url as string}
                alt=""
                className="mx-auto h-16 w-16 rounded-full object-cover border-2 border-amber-500/40 shadow"
              />
            ) : (
              <div className="mx-auto h-16 w-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-amber-700">
                  {(user.email?.[0] ?? 'U').toUpperCase()}
                </span>
              </div>
            )}

            <div className="text-center space-y-1">
              <h1 className="text-xl font-bold text-slate-900">One last step</h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Confirm the name you would like printed on your course certificate.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label htmlFor="display-name" className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
                  Full name (as on certificate)
                </label>
                <input
                  ref={nameRef}
                  id="display-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={80}
                  className="w-full px-4 py-3 rounded-xl text-sm text-slate-900 bg-white/70 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 neu-pressed-sm"
                  required
                />
              </div>

              {error ? (
                <p className="text-xs text-red-600 neu-pressed-sm rounded-lg px-3 py-2">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-60 disabled:pointer-events-none transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Continue to course →'
                )}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ── Step 1: sign-in page (no user yet) ───────────────────────────────────
  return (
    <>
      <SEO pageKey="eCourseLearn" />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="neu-card max-w-md w-full rounded-2xl border border-white/60 bg-[#e8ecf2] p-8 shadow-neu space-y-7">

          {/* Preqal ribbon + heading */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-500/15 mx-auto">
              <img
                src="/e-courses/ui/star-ribbon.png"
                alt=""
                className="h-10 w-10 object-contain"
                decoding="async"
              />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-snug">
              Register for the E-Course
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sign in with your Google account to register. Your name will appear on your
              certificate when you complete the course.
            </p>
          </div>

          {/* What you get */}
          <ul className="space-y-2 text-sm text-slate-700">
            {[
              'Track your progress across all 9 modules',
              'Receive a verifiable certificate on completion',
              'Share your achievement with a unique certificate ID',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          {error ? (
            <p className="text-xs text-red-600 neu-pressed-sm rounded-lg px-3 py-2 text-center">{error}</p>
          ) : null}

          {/* Google sign-in button */}
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 neu-raised-sm border border-slate-200/80 transition-all shadow-sm"
          >
            <GoogleIcon className="h-5 w-5 shrink-0" />
            Continue with Google
          </button>

          <p className="text-[11px] text-center text-slate-500 leading-relaxed">
            By registering you agree to our{' '}
            <a href="/privacy-policy" className="underline hover:text-slate-700">Privacy Policy</a>{' '}
            and{' '}
            <a href="/terms-of-service" className="underline hover:text-slate-700">Terms of Service</a>.
          </p>
        </div>
      </div>
    </>
  );
};

export default ECourseRegister;
