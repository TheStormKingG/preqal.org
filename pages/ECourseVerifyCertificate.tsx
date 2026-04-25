import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, ShieldCheck } from 'lucide-react';
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
  course_id: string;
  issued_at: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Mask an email for public display: s***e@domain.com */
function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain || local.length <= 2) return `${local[0]}***@${domain ?? ''}`;
  return `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ECourseVerifyCertificate: React.FC = () => {
  const { certKey } = useParams<{ certKey: string }>();
  const [cert, setCert] = useState<CertRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [verifiedAt] = useState(() => new Date());

  useEffect(() => {
    if (!certKey) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    supabase
      .from('ecourse_certificates')
      .select('id, cert_key, recipient_name, email, course_title, course_id, issued_at')
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
                  {certKey.toUpperCase()}
                </code>
              ) : (
                'provided'
              )}{' '}
              does not match any certificate issued by Preqal Inc. Please check the ID and try again.
            </p>
            <p className="text-xs text-slate-400">
              Certificate IDs are in the format <code className="font-mono">PREQAL-YYYYMM-XXXXXXXX</code>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 py-16">

        {/* Verification card */}
        <div className="neu-card max-w-lg w-full rounded-2xl border border-white/60 bg-[#e8ecf2] shadow-neu overflow-hidden">

          {/* Valid header bar */}
          <div className="bg-emerald-600 px-6 py-5 flex items-center gap-4">
            <ShieldCheck className="h-9 w-9 text-white shrink-0" aria-hidden />
            <div>
              <p className="text-base font-extrabold text-white tracking-wide">Authentic Certificate</p>
              <p className="text-xs text-emerald-100 mt-0.5">
                Verified live against Preqal Inc certificate registry
              </p>
            </div>
          </div>

          {/* Certificate details */}
          <div className="p-6 sm:p-8 space-y-6">

            {/* Ribbon + recipient */}
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
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  {maskEmail(cert.email)}
                </p>
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
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Certificate ID</dt>
                <dd className="font-mono font-bold text-slate-900 text-xs break-all">{cert.cert_key}</dd>
              </div>
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Issued</dt>
                <dd className="font-bold text-slate-900">{formatCertDate(cert.issued_at)}</dd>
              </div>
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Registered Account</dt>
                <dd className="font-mono text-xs font-semibold text-slate-700 break-all">{maskEmail(cert.email)}</dd>
              </div>
              <div className="neu-pressed-sm rounded-xl p-3 space-y-0.5">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Issued by</dt>
                <dd className="font-bold text-slate-900 text-xs leading-snug">
                  Dr. Stefan Gravesande<br />
                  <span className="text-slate-500 font-normal">Principal Director, Preqal Inc</span>
                </dd>
              </div>
            </dl>

            {/* Verification timestamp */}
            <div className="neu-pressed-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-hidden />
              <p className="text-xs text-slate-600 leading-snug">
                <span className="font-bold text-slate-800">Verified</span> on {formatCertDate(verifiedAt)} at{' '}
                {verifiedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} against the live Preqal
                certificate registry. This record cannot be altered.
              </p>
            </div>

            {/* Back link */}
            <div className="text-center pt-1">
              <Link
                to="/e-courses"
                className="text-xs font-semibold text-amber-700 hover:text-amber-600 underline underline-offset-2"
              >
                ← Preqal E-Courses
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-400 text-center max-w-sm leading-relaxed">
          This certificate is digitally registered and verifiable at{' '}
          <span className="font-semibold">preqal.org</span>. Any physical copy bearing a different ID is invalid.
        </p>
      </div>
    </>
  );
};

export default ECourseVerifyCertificate;
