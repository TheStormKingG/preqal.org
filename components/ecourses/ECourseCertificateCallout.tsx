import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { PREQAL_QMS_E_COURSE_SLUG, certificateVerifyUrl } from '../../lib/ecourseCertificateConstants';
import { buildPreqalEcourseCertificatePdf, downloadBlob } from '../../lib/ecourseCertificatePdf';

type IssuePayload = {
  already_issued?: boolean;
  public_id: string;
  holder_name: string;
  completed_at: string;
  issued_at: string;
};

const ECourseCertificateCallout: React.FC<{ entireCourseComplete: boolean }> = ({ entireCourseComplete }) => {
  const { user, loading: authLoading, registration, regLoading, signInWithGoogle } = useAuth();
  const [existing, setExisting] = useState<{ public_id: string; completed_at: string } | null>(null);
  const [existingLoading, setExistingLoading] = useState(false);
  const [issueBusy, setIssueBusy] = useState(false);
  const [issueErr, setIssueErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setExisting(null);
      setExistingLoading(false);
      return;
    }
    let cancelled = false;
    setExistingLoading(true);
    supabase
      .from('ecourse_certificates')
      .select('public_id, completed_at')
      .eq('user_id', user.id)
      .eq('course_slug', PREQAL_QMS_E_COURSE_SLUG)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data) setExisting(null);
        else setExisting(data as { public_id: string; completed_at: string });
        setExistingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id, registration?.holder_legal_name]);

  const downloadForPayload = useCallback(async (p: IssuePayload) => {
    const verifyUrl = certificateVerifyUrl(p.public_id);
    const blob = await buildPreqalEcourseCertificatePdf({
      holderName: p.holder_name,
      publicId: p.public_id,
      completedAt: new Date(p.completed_at),
      verifyUrl,
    });
    const safe = p.holder_name.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'learner';
    downloadBlob(blob, `Preqal-QMS-E-Course-Certificate-${safe}.pdf`);
  }, []);

  const onIssueOrDownload = async () => {
    setIssueErr(null);
    setIssueBusy(true);
    try {
      const { data, error } = await supabase.rpc('issue_ecourse_certificate', {
        p_course_slug: PREQAL_QMS_E_COURSE_SLUG,
      });
      if (error) {
        const msg = error.message ?? '';
        if (msg.toLowerCase().includes('not_registered')) {
          setIssueErr('Register first with your legal name, then return here to issue your certificate.');
        } else if (msg.includes('function') || error.code === '42883') {
          setIssueErr('Certificate issuance is not set up yet. Run the Supabase SQL migration for issue_ecourse_certificate.');
        } else {
          setIssueErr(msg || 'Could not issue certificate.');
        }
        return;
      }
      const payload = data as IssuePayload;
      if (!payload?.public_id) {
        setIssueErr('Unexpected response from server.');
        return;
      }
      await downloadForPayload(payload);
      setExisting({ public_id: payload.public_id, completed_at: payload.completed_at });
    } catch (e) {
      setIssueErr(e instanceof Error ? e.message : 'Failed to build PDF.');
    } finally {
      setIssueBusy(false);
    }
  };

  if (!entireCourseComplete) return null;

  return (
    <section className="mb-8 shrink-0 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white/80 neu-raised-sm p-5 sm:p-6 shadow-neu" aria-label="Course certificate">
      <div className="flex items-start gap-3">
        <span className="neu-pressed-sm rounded-xl p-2.5 text-amber-700 shrink-0">
          <Award className="h-6 w-6" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-base font-bold text-slate-900">Course complete — certificate</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You finished every module in this browser session. Issue an official certificate tied to your account and a unique
            ID you can verify on preqal.org.
          </p>

          {authLoading || regLoading || existingLoading ? (
            <p className="text-sm text-slate-500 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
              Checking account…
            </p>
          ) : !user ? (
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center pt-1">
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="inline-flex justify-center px-4 py-2.5 rounded-xl text-sm font-bold text-slate-800 bg-white border border-slate-200 neu-raised-sm"
              >
                Sign in with Google
              </button>
              <span className="text-xs text-slate-500 sm:pl-2">
                Then{' '}
                <Link to="/e-courses/register" className="font-bold text-amber-700 hover:underline">
                  register
                </Link>{' '}
                your legal name for the certificate.
              </span>
            </div>
          ) : !registration ? (
            <p className="text-sm text-slate-700">
              <Link to="/e-courses/register" className="font-bold text-amber-700 hover:underline">
                Complete registration
              </Link>{' '}
              with the name that should appear on your certificate.
            </p>
          ) : (
            <div className="space-y-2 pt-1">
              {existing ? (
                <p className="text-xs text-slate-600">
                  Certificate ID:{' '}
                  <span className="font-mono font-semibold text-slate-800 break-all">{existing.public_id}</span>
                  {' · '}
                  <Link
                    to={`/e-courses/certificate/verify?id=${encodeURIComponent(existing.public_id)}`}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    Verify
                  </Link>
                </p>
              ) : null}
              {issueErr ? <p className="text-sm text-red-700">{issueErr}</p> : null}
              <button
                type="button"
                onClick={() => void onIssueOrDownload()}
                disabled={issueBusy}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm disabled:opacity-50"
              >
                {issueBusy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
                    Working…
                  </>
                ) : existing ? (
                  'Download certificate PDF again'
                ) : (
                  'Issue & download certificate'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ECourseCertificateCallout;
