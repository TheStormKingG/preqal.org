import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';
import { formatCertDate } from '../lib/ecourseCertificateConstants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CertRecord {
  id: string;
  cert_key: string;
  recipient_name: string;
  email: string;
  course_title: string;
  issued_at: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ECourseVerifyCertificate: React.FC = () => {
  const { certKey } = useParams<{ certKey: string }>();
  const [cert, setCert] = useState<CertRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!certKey) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    supabase
      .from('ecourse_certificates')
      .select('id, cert_key, recipient_name, email, course_title, issued_at')
      .eq('cert_key', certKey.toUpperCase())
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setCert(data as CertRecord);
        }
        setLoading(false);
      });
  }, [certKey]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-label="Checking certificate…" />
      </div>
    );
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !cert) {
    return (
      <>
        <SEO pageKey="home" />
        <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-6">
          <div className="neu-card max-w-md w-full rounded-2xl border border-white/60 bg-[#e8ecf2] p-8 shadow-neu text-center space-y-5">
            <XCircle className="mx-auto h-14 w-14 text-red-500" aria-hidden />
            <h1 className="text-xl font-bold text-slate-900">Certificate not found</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              The certificate ID{' '}
              {certKey ? (
                <code className="font-mono text-xs bg-slate-200/60 px-1.5 py-0.5 rounded">
                  {certKey}
                </code>
              ) : (
                'provided'
              )}{' '}
              does not match any certificate issued by Preqal Inc. Please check the ID and try again.
            </p>
            <Link
              to="/e-courses"
              className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-amber-500 hover:bg-amber-400 neu-raised-sm transition-colors"
            >
              ← Back to E-Courses
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ── Valid certificate ─────────────────────────────────────────────────────
  return (
    <>
      <SEO pageKey="home" />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
        {/* Verification card */}
        <div className="neu-card max-w-lg w-full rounded-2xl border border-white/60 bg-[#e8ecf2] shadow-neu overflow-hidden">

          {/* Green "Valid" header bar */}
          <div className="bg-emerald-600 px-6 py-4 flex items-center gap-3">
            <CheckCircle2 className="h-7 w-7 text-white shrink-0" aria-hidden />
            <div>
              <p className="text-sm font-bold text-white">Valid Certificate</p>
              <p className="text-xs text-emerald-100">Issued by Preqal Inc — officially verified</p>
            </div>
          </div>

          {/* Certificate details */}
          <div className="p-6 sm:p-8 space-y-6">

            {/* Ribbon + heading */}
            <div className="flex flex-col items-center gap-3 text-center">
              <img
                src="/e-courses/ui/star-ribbon.png"
                alt=""
                className="h-20 w-20 object-contain drop-shadow-lg"
                decoding="async"
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                  Certificate of Achievement
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {cert.recipient_name}
                </h1>
              </div>
            </div>

            <div className="space-y-1 text-center">
              <p className="text-sm text-slate-600">has successfully completed and received a passing grade in</p>
              <p className="text-base font-bold text-slate-900">{cert.course_title}</p>
              <p className="text-xs text-slate-500">An online Quality Management course offered by Preqal Inc</p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200/60" />

            {/* Meta fields */}
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Certificate ID</dt>
                <dd className="font-mono font-bold text-slate-900 text-xs break-all">{cert.cert_key}</dd>
              </div>
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Issued</dt>
                <dd className="font-bold text-slate-900">{formatCertDate(cert.issued_at)}</dd>
              </div>
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5 sm:col-span-2">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Issued by</dt>
                <dd className="font-bold text-slate-900">Dr. Stefan Gravesande · Principal Director, Preqal Inc</dd>
              </div>
            </dl>

            {/* Back link */}
            <div className="text-center pt-2">
              <Link
                to="/e-courses"
                className="text-xs font-semibold text-amber-700 hover:text-amber-600 underline underline-offset-2"
              >
                ← Preqal E-Courses
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center max-w-sm">
          This verification was performed live against the Preqal certificate registry on{' '}
          {formatCertDate(new Date())}.
        </p>
      </div>
    </>
  );
};

export default ECourseVerifyCertificate;
