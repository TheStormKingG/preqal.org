import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Loader2, Search, ShieldCheck, XCircle } from 'lucide-react';
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

/** Normalise user input to expected cert key format */
function normaliseCertKey(raw: string): string {
  return raw.trim().toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const ECourseVerifyCertificate: React.FC = () => {
  const { certKey: urlKey } = useParams<{ certKey: string }>();
  const navigate = useNavigate();

  // Search form state
  const [inputKey, setInputKey]   = useState(urlKey ?? '');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched]   = useState(false);

  // Result state
  const [cert, setCert]         = useState<CertRecord | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<Date | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(async (key: string) => {
    const normalised = normaliseCertKey(key);
    if (!normalised) return;

    setSearching(true);
    setSearched(false);
    setCert(null);
    setNotFound(false);

    // Preferred path: SECURITY DEFINER function that returns only pre-masked,
    // public-safe fields. Falls back to the legacy direct select if the RPC
    // isn't deployed yet.
    let record: CertRecord | null = null;
    const { data: rpcData, error: rpcError } = await supabase.rpc('verify_certificate', {
      p_cert_key: normalised,
    });
    if (!rpcError) {
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      record = (row as CertRecord | undefined) ?? null;
    } else {
      const { data } = await supabase
        .from('ecourse_certificates')
        .select('id, cert_key, recipient_name, email, course_title, course_id, issued_at')
        .eq('cert_key', normalised)
        .maybeSingle();
      record = (data as CertRecord | null) ?? null;
    }

    if (!record) {
      setNotFound(true);
      setCert(null);
    } else {
      setCert(record);
      setNotFound(false);
      setVerifiedAt(new Date());
    }

    setSearched(true);
    setSearching(false);
  }, []);

  // Auto-search when there's a cert key in the URL
  useEffect(() => {
    if (urlKey) {
      const raf = requestAnimationFrame(() => {
        setInputKey(urlKey);
        void runSearch(urlKey);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [urlKey, runSearch]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const normalised = normaliseCertKey(inputKey);
    if (!normalised) return;
    // Update the URL so the result is bookmarkable/shareable
    navigate(`/verify/${normalised}`, { replace: false });
  }

  return (
    <>
      <SEO pageKey="verifyCertificate" />
      <div className="min-h-screen flex flex-col items-center justify-start pt-32 pb-16 px-4 gap-6">

        {/* ── Search card ──────────────────────────────────────────────────── */}
        <div className="neu-card max-w-lg w-full rounded-2xl border border-white/60 bg-[#e8ecf2] shadow-neu overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200/60 flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-amber-500 shrink-0" aria-hidden />
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-wide">Verify a Certificate</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm the authenticity of a Preqal certificate
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="certKeyInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Certificate ID
              </label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="certKeyInput"
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="PREQAL-YYYYMM-XXXXXXXX"
                  spellCheck={false}
                  autoCapitalize="characters"
                  className="w-full font-mono text-sm px-4 py-3 pr-12 rounded-xl neu-pressed-sm bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/60 transition-all"
                />
                <button
                  type="submit"
                  disabled={searching || !inputKey.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors neu-raised-sm"
                  aria-label="Search"
                >
                  {searching
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Search className="h-4 w-4" />
                  }
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Format: <span className="font-mono">PREQAL-202604-XXXXXXXX</span> — found at the bottom of your certificate PDF.
              </p>
            </div>

            <button
              type="submit"
              disabled={searching || !inputKey.trim()}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors neu-raised-sm"
            >
              {searching ? 'Verifying…' : 'Verify Certificate'}
            </button>
          </form>
        </div>

        {/* ── Not found ────────────────────────────────────────────────────── */}
        {searched && notFound && (
          <div className="neu-card max-w-lg w-full rounded-2xl border border-white/60 bg-[#e8ecf2] shadow-neu p-6 text-center space-y-3">
            <XCircle className="mx-auto h-12 w-12 text-red-400" aria-hidden />
            <p className="font-bold text-slate-900">Certificate not found</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The ID{' '}
              <code className="font-mono text-xs bg-slate-200/60 px-1.5 py-0.5 rounded">
                {normaliseCertKey(inputKey)}
              </code>{' '}
              does not match any certificate in the Preqal registry. Double-check the ID and try again.
            </p>
          </div>
        )}

        {/* ── Valid certificate ─────────────────────────────────────────────── */}
        {searched && cert && verifiedAt && (
          <div className="neu-card max-w-lg w-full rounded-2xl border border-white/60 bg-[#e8ecf2] shadow-neu overflow-hidden">
            {/* Valid header bar */}
            <div className="bg-emerald-600 px-6 py-5 flex items-center gap-4">
              <ShieldCheck className="h-9 w-9 text-white shrink-0" aria-hidden />
              <div>
                <p className="text-base font-extrabold text-white tracking-wide">Authentic Certificate</p>
                <p className="text-xs text-emerald-100 mt-0.5">
                  Verified live against the Preqal Inc certificate registry
                </p>
              </div>
            </div>

            {/* Certificate details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Recipient */}
              <div className="text-center space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
                  Certificate of Achievement
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {cert.recipient_name}
                </h2>
                <p className="text-xs text-slate-500 font-mono">{maskEmail(cert.email)}</p>
              </div>

              <div className="space-y-1 text-center">
                <p className="text-sm text-slate-600">has successfully completed and received a passing grade in</p>
                <p className="text-base font-bold text-slate-900">{cert.course_title}</p>
                <p className="text-xs text-slate-500">
                  An online Quality Management course offered by Preqal Inc
                </p>
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
        )}

        <p className="text-[11px] text-slate-400 text-center max-w-sm leading-relaxed">
          Certificates are digitally registered and verifiable at{' '}
          <span className="font-semibold">preqal.org</span>. Any physical copy bearing a different ID is invalid.
        </p>
      </div>
    </>
  );
};

export default ECourseVerifyCertificate;
