import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { supabase } from '../lib/supabaseClient';

type VerifyPayload = {
  valid: boolean;
  reason?: string;
  public_id?: string;
  holder_name?: string;
  course_slug?: string;
  completed_at?: string;
  issued_at?: string;
};

const ECourseVerifyCertificate: React.FC = () => {
  const [params] = useSearchParams();
  const id = (params.get('id') ?? '').trim();
  const [result, setResult] = useState<VerifyPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id || id.length < 8) {
        setResult({ valid: false, reason: 'invalid_id' });
        setLoading(false);
        return;
      }
      setLoading(true);
      setErr(null);
      const { data, error } = await supabase.rpc('verify_ecourse_certificate', { p_public_id: id });
      if (cancelled) return;
      if (error) {
        setErr(
          error.message.includes('function') || error.code === '42883'
            ? 'Verification is not configured yet (database function missing).'
            : error.message,
        );
        setResult(null);
      } else {
        setResult((data as VerifyPayload) ?? { valid: false, reason: 'unknown' });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const fmt = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
  };

  return (
    <>
      <SEO pageKey="eCourseVerifyCertificate" />

      <div className="min-h-screen pb-20 pt-24 px-4">
        <div className="max-w-lg mx-auto neu-card neu-raised rounded-2xl border border-white/50 shadow-neu p-6 sm:p-8">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Certificate verification</h1>
          <p className="text-sm text-slate-600 mb-6">
            Enter the certificate ID from the PDF, or open this page from the verification link printed on the certificate.
          </p>

          {loading ? (
            <p className="text-sm text-slate-600">Checking…</p>
          ) : err ? (
            <p className="text-sm text-red-700">{err}</p>
          ) : result?.valid ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-4 space-y-2 text-sm text-slate-800">
              <p className="font-bold text-emerald-900">Valid certificate</p>
              <p>
                <span className="text-slate-500">Recipient:</span> <span className="font-semibold">{result.holder_name}</span>
              </p>
              <p>
                <span className="text-slate-500">Certificate ID:</span>{' '}
                <span className="font-mono text-xs break-all">{result.public_id}</span>
              </p>
              <p>
                <span className="text-slate-500">Course:</span> {result.course_slug}
              </p>
              <p>
                <span className="text-slate-500">Completion recorded:</span> {fmt(result.completed_at)}
              </p>
              <p>
                <span className="text-slate-500">Issued:</span> {fmt(result.issued_at)}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-4 text-sm text-amber-950">
              <p className="font-bold">Not found or invalid</p>
              <p className="mt-1">No certificate matches this ID. Check for typos or contact Preqal if you believe this is an error.</p>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-slate-500">
            <Link to="/e-courses" className="font-bold text-amber-700 hover:underline">
              E-Course overview
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ECourseVerifyCertificate;
