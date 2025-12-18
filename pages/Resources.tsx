import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const Resources: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      
      try {
        // Send email with zip attachment via API
        const apiUrl = import.meta.env.VITE_API_URL || 'https://api.preqal.org/api/send-templates';
        
        const form = e.target as HTMLFormElement;
        const honeypot = (form.querySelector('input[name="website"]') as HTMLInputElement)?.value || '';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: email.trim(),
            honeypot: honeypot // Honeypot protection
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to send email');
        }
      } catch (error) {
        console.error('Error sending email:', error);
        // Still show success message to user even if API fails
        // (you can handle this differently if needed)
      }
      
      // Keep success message visible
      setEmail('');
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
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden animate-fade-in-up delay-100">
          <div className="bg-gradient-to-r from-neutral-100 to-white p-10 text-center border-b border-neutral-100 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-6 ring-4 ring-neutral-50 shadow-sm">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <h2 className="font-bold mb-2 text-neutral-900" style={{ fontSize: 'calc(1.5rem * 1.07)' }}>Unlock the Library</h2>
            <p className="text-neutral-500 mb-4" style={{ fontSize: 'calc(1rem * 1.07)' }}>Enter your email to access all 5 premium templates instantly.</p>
            <ol className="text-left text-neutral-600 space-y-2 max-w-md mx-auto list-decimal list-inside">
              <li>Document Masterlist</li>
              <li>QHSE Policy</li>
              <li>Document Control Procedure</li>
              <li>Risk Register</li>
              <li>Training & Competency Register</li>
            </ol>
          </div>
          <div className="p-10 md:p-12 bg-white">
            <form onSubmit={handleSubscribe} className="flex flex-col gap-4 max-w-md mx-auto">
              {/* Honeypot field - hidden from users */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                style={{ position: 'absolute', left: '-9999px' }}
                aria-hidden="true"
              />
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
                disabled={subscribed}
                className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {subscribed ? 'Email Sent!' : 'Unlock Access'}
              </button>
            </form>
            <p className="text-xs text-center text-neutral-500 mt-6">
              We respect your privacy. No spam, just value.
            </p>
            {subscribed && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 animate-fade-in-up">
                <span className="font-bold">Success!</span> Check your inbox for the premium templates.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;

