import React, { useState } from 'react';
import { Download, FileText, Lock, Layout, ClipboardCheck } from 'lucide-react';
import { Resource } from '../types';

const resources: Resource[] = [
  { id: '1', title: 'SOP Template (Editable)', type: 'Template', description: 'A standardized Word format for creating ISO-compliant Standard Operating Procedures.' },
  { id: '2', title: 'Risk Scoring Matrix', type: 'Tool', description: 'Excel-based calculator to quantify likelihood and severity of operational risks.' },
  { id: '3', title: 'IMS Roadmap Visual', type: 'PDF', description: 'A timeline view of the typical 6-month journey to ISO certification.' },
  { id: '4', title: 'Poultry Audit Checklist', type: 'Tool', description: 'Self-assessment tool for broiler and layer farms covering 50+ critical control points.' },
  { id: '5', title: 'Farm Layout Planner', type: 'Template', description: 'Grid and icon set for planning biosecurity zones and traffic flow.' },
];

const Resources: React.FC = () => {
  const [email, setEmail] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setUnlocked(true);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header with Seamless Fade and Pattern - Fades to Transparent */}
      <div className="bg-[linear-gradient(to_bottom,#171717_0%,#171717_80%,transparent_100%)] py-24 mb-16 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-scatter-pattern opacity-[0.3] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in-up relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">Resources & Tools</h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Professional tools to kickstart your compliance journey. Free for the community.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!unlocked ? (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden animate-fade-in-up delay-100">
            <div className="bg-gradient-to-r from-neutral-100 to-white p-10 text-center border-b border-neutral-100 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-6 ring-4 ring-neutral-50 shadow-sm">
                <Lock className="h-8 w-8 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-neutral-900">Unlock the Library</h2>
              <p className="text-neutral-500 mb-4">Enter your email to access all 5 premium templates instantly.</p>
              <ol className="text-left text-neutral-600 space-y-2 max-w-md mx-auto list-decimal list-inside">
                <li>Document Masterlist</li>
                <li>QHSE Policy</li>
                <li>Document Control Procedure</li>
                <li>Risk Register</li>
                <li>Training & Competency Register</li>
              </ol>
            </div>
            <div className="p-10 md:p-12 bg-white">
              <form onSubmit={handleUnlock} className="flex flex-col gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all placeholder-neutral-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20"
                >
                  Unlock Access
                </button>
              </form>
              <p className="text-xs text-center text-neutral-500 mt-6">
                We respect your privacy. No spam, just value.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
            {resources.map((res) => (
              <div key={res.id} className="bg-white/90 backdrop-blur rounded-xl p-6 border border-neutral-200 hover:border-amber-500/40 hover:shadow-lg hover:shadow-neutral-200/50 transition-all shadow-sm group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-[#f6f8fb] rounded-lg group-hover:bg-amber-50 transition-colors border border-neutral-100">
                    {res.type === 'Template' && <Layout className="text-neutral-500 group-hover:text-amber-600 transition-colors" />}
                    {res.type === 'Tool' && <ClipboardCheck className="text-neutral-500 group-hover:text-amber-600 transition-colors" />}
                    {res.type === 'PDF' && <FileText className="text-neutral-500 group-hover:text-amber-600 transition-colors" />}
                  </div>
                  <span className="text-xs font-bold text-neutral-500 uppercase border border-neutral-200 px-2 py-1 rounded bg-[#f6f8fb]">{res.type}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">{res.title}</h3>
                <p className="text-sm text-neutral-500 mb-6 leading-relaxed">{res.description}</p>
                <button className="w-full flex items-center justify-center space-x-2 py-2 border border-neutral-200 rounded-lg text-neutral-500 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 font-medium transition-all">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;