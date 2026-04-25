import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { PREQAL_QMS_E_COURSE_SLUG } from '../lib/ecourseCertificateConstants';

const ECourseRegister: React.FC = () => {
  const { user, loading, registration, regLoading, refreshRegistration, signInWithGoogle, signOut } = useAuth();
  const [holderName, setHolderName] = useState('');
  const [agree, setAgree] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const name = holderName.trim();
    if (name.length < 2) {
      setSaveError('Enter your full legal name as it should appear on the certificate.');
      return;
    }
    if (!agree) {
      setSaveError('Please confirm you agree to the course terms.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const { error } = await supabase.from('ecourse_course_registrations').upsert(
      {
        user_id: user.id,
        course_slug: PREQAL_QMS_E_COURSE_SLUG,
        holder_legal_name: name,
        terms_accepted_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
    setSaving(false);
    if (error) {
      setSaveError(
        error.message.includes('relation') || error.code === '42P01'
          ? 'Registration is not available yet. Ask your admin to run the Supabase migration for ecourse_course_registrations.'
          : error.message,
      );
      return;
    }
    await refreshRegistration();
  };

  return (
    <>
      <SEO pageKey="eCourseRegister" />

      <div className="min-h-screen pb-20 pt-24 px-4">
        <div className="max-w-lg mx-auto neu-card neu-raised rounded-2xl border border-white/50 shadow-neu p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">E-Course</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Register with Google</h1>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Sign in with the Google account you want tied to your certificate. Then confirm your legal name and terms.
          </p>

          {loading ? (
            <p className="text-sm text-slate-600">Checking session…</p>
          ) : !user ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-200 neu-raised-sm hover:bg-slate-50 transition-colors"
              >
                Continue with Google
              </button>
              <p className="text-xs text-slate-500">
                After Google redirects you back here, complete the short form below. Enable the Google provider in Supabase
                (Authentication → Providers) and add this redirect URL:{' '}
                <span className="font-mono text-[10px] break-all">{window.location.origin}/e-courses/register</span>
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
                <span className="font-semibold truncate">{user.email}</span>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="text-xs font-bold text-amber-700 hover:text-amber-600 neu-pressed-sm px-3 py-1.5 rounded-lg"
                >
                  Sign out
                </button>
              </div>

              {regLoading ? (
                <p className="text-sm text-slate-600">Loading registration…</p>
              ) : registration ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                  <p className="font-bold">You are registered</p>
                  <p className="mt-1">
                    Certificate name on file: <span className="font-semibold">{registration.holder_legal_name}</span>
                  </p>
                  <Link
                    to="/e-courses/learn"
                    className="inline-block mt-3 text-sm font-bold text-amber-800 hover:text-amber-700"
                  >
                    Go to course →
                  </Link>
                </div>
              ) : (
                <form onSubmit={onSubmitRegistration} className="space-y-4">
                  <div>
                    <label htmlFor="ec-holder" className="block text-xs font-bold text-slate-600 mb-1">
                      Full legal name (as on certificate)
                    </label>
                    <input
                      id="ec-holder"
                      value={holderName}
                      onChange={(e) => setHolderName(e.target.value)}
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner"
                      placeholder="e.g. Jane Q. Learner"
                    />
                  </div>
                  <label className="flex gap-2 items-start text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
                    <span>
                      I agree to the{' '}
                      <Link to="/terms-of-service" className="font-bold text-amber-700 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and understand my name and completion may be stored to issue and verify my certificate.
                    </span>
                  </label>
                  {saveError ? <p className="text-sm text-red-700">{saveError}</p> : null}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 neu-raised-sm disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Complete registration'}
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            <Link to="/e-courses" className="font-bold text-amber-700 hover:underline">
              ← E-Course overview
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ECourseRegister;
