import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import loginDesignImg from '../assets/yatra_login_design.jpg';
import rajasthanWatermark from '../assets/rajasthan_watermark.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#c8deec] flex items-center justify-center p-0 lg:p-4 font-sans select-none overflow-x-hidden">
      {/* Background artwork composition container strictly matching 1024:682 aspect ratio */}
      <div
        className="relative w-full max-w-[1280px] max-h-[96vh] aspect-[1024/682] bg-contain bg-center bg-no-repeat shadow-2xl overflow-hidden rounded-none lg:rounded-2xl"
        style={{ backgroundImage: `url(${loginDesignImg})` }}
      >
        {/* Interactive Form Card Overlay:
            On desktop (lg+), perfectly overlays the exact card area in yatra_login_design.jpg
            (bounds: left 56.2%, top 9.5%, width 40.0%, height 67.5%)
            On smaller screens (< lg), renders as an elegant centered responsive card.
        */}
        <div className="lg:absolute lg:left-[56.2%] lg:top-[9.5%] lg:w-[40.0%] lg:h-[67.5%] w-full h-full flex items-center justify-center p-4 lg:p-0 z-20">
          <div className="w-full max-w-md lg:max-w-none h-full bg-white rounded-[22px] xl:rounded-[26px] p-5 xl:p-6 shadow-2xl lg:shadow-none flex flex-col justify-between border border-white/60">
            
            {/* Top Row: Pill Badge + Rajasthan Map Watermark */}
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eef8f5] border border-teal-200/80 text-[10px] font-extrabold uppercase tracking-wider text-teal-800">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>State EV Command Console</span>
              </div>
              <div className="w-16 h-12 relative -mt-1 -mr-1 flex items-center justify-center">
                <img
                  src={rajasthanWatermark}
                  alt="Rajasthan India"
                  className="w-full h-full object-contain pointer-events-none select-none opacity-90"
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="-mt-1">
              <h2 className="text-xl xl:text-[22px] font-black text-slate-900 tracking-tight leading-snug">
                Officer Portal Sign In
              </h2>
              <p className="text-[11px] xl:text-xs text-slate-500 mt-1 leading-normal font-medium">
                Enter your authorized credentials to access the Yatra EV Fleet Operations Platform.
              </p>
            </div>

            {/* Error message display */}
            {error && (
              <div className="py-2 px-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-rose-600">error</span>
                <span className="truncate">{error}</span>
              </div>
            )}

            {/* Functional Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3 xl:space-y-3.5 my-auto">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Official Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yatra.dev"
                    required
                    className="w-full h-10 xl:h-11 bg-slate-50/90 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all select-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-10 xl:h-11 bg-slate-50/90 border border-slate-200 rounded-xl pl-10 pr-10 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-500/20 transition-all select-text"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500/20 accent-teal-600"
                  />
                  <span className="text-[11px] font-medium text-slate-700">Keep me signed in</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert('Please contact Platform Admin for password reset.'); }}
                  className="text-[11px] font-bold text-teal-700 hover:text-teal-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 xl:h-12 bg-gradient-to-r from-[#036b76] via-[#008172] to-[#109f6e] hover:brightness-105 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-teal-800/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating Officer...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-[10px] text-slate-400 text-center font-medium my-1">
              Authorized personnel only. All access is logged and audited.
            </p>

            {/* Bottom Card Metrics: 4 columns matching reference image */}
            <div className="grid grid-cols-4 gap-1 pt-3 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center justify-center py-1">
                <span className="material-symbols-outlined text-teal-700 text-base">directions_bus</span>
                <div className="text-[10px] font-extrabold text-slate-900 mt-0.5 leading-none">0+</div>
                <div className="text-[9px] text-slate-500 font-medium leading-tight">EV Buses</div>
              </div>
              <div className="flex flex-col items-center justify-center py-1 border-l border-slate-100">
                <span className="material-symbols-outlined text-teal-700 text-base">eco</span>
                <div className="text-[10px] font-extrabold text-slate-900 mt-0.5 leading-none">Cleaner</div>
                <div className="text-[9px] text-slate-500 font-medium leading-tight">Cities</div>
              </div>
              <div className="flex flex-col items-center justify-center py-1 border-l border-slate-100">
                <span className="material-symbols-outlined text-teal-700 text-base">groups</span>
                <div className="text-[10px] font-extrabold text-slate-900 mt-0.5 leading-none">Greener</div>
                <div className="text-[9px] text-slate-500 font-medium leading-tight">Rajasthan</div>
              </div>
              <div className="flex flex-col items-center justify-center py-1 border-l border-slate-100">
                <span className="material-symbols-outlined text-teal-700 text-base">trending_up</span>
                <div className="text-[10px] font-extrabold text-slate-900 mt-0.5 leading-none">Sustainable</div>
                <div className="text-[9px] text-slate-500 font-medium leading-tight">Future</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

