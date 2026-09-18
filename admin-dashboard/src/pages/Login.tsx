import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Bus,
  Zap,
  BarChart3,
  Leaf,
  Users,
  TrendingUp,
  Landmark,
  Sparkles
} from 'lucide-react';
import yatraLoginBg from '../assets/yatra_login_bg.jpg';
import rajasthanWatermark from '../assets/rajasthan_watermark.png';
import yatraLogoMarkImg from '../assets/yatra_logo_mark.png';

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
      setError(
        err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between p-3 sm:p-5 lg:p-7 font-sans select-none overflow-x-hidden bg-slate-900">
      {/* Background Scenery Image with subtle gradient protection */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${yatraLoginBg})` }}
      >
        {/* Soft gradient overlay for text readability without obscuring scenery */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-900/40 to-slate-950/65 backdrop-contrast-[1.05]" />
      </div>

      {/* TOP HEADER: Government Branding & State Tagline */}
      <header className="relative z-10 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center p-1.5 shadow-md border border-white/60">
            <Landmark className="w-5 h-5 text-emerald-800" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white tracking-wide">
                Government of Rajasthan
              </span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 border border-emerald-400/30">
                राजस्थान सरकार
              </span>
            </div>
            <p className="text-[10px] sm:text-xs font-medium text-slate-200/90 tracking-tight">
              Department of Transport & Energy
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-slate-900/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-medium text-slate-100">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sustainable Mobility for a Better Rajasthan</span>
        </div>
      </header>

      {/* MAIN CONTENT AREA: Left Hero Branding + Right Floating Sign-In Card */}
      <main className="relative z-10 w-full max-w-7xl mx-auto my-auto py-6 sm:py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* LEFT COLUMN: Yatra Brand, Heading & 4 Feature Badges */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-white pr-0 lg:pr-6">
          {/* Main Logo & Platform Badge */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest text-emerald-300">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rajasthan EV Fleet Intelligence Platform</span>
            </div>

            <div className="pt-2 flex items-center gap-5">
              <img
                src={yatraLogoMarkImg}
                alt="Yatra Emblem"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-2xl flex-shrink-0 transition-transform hover:scale-105 duration-300"
              />
              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white drop-shadow-md">
                    YATRA
                  </h1>
                  <span className="text-xs sm:text-sm font-bold tracking-widest text-emerald-400 uppercase">
                    स्मार्ट गतिशील राजस्थान
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-emerald-200/90 tracking-wider uppercase mt-0.5">
                  Smart Mobility | Cleaner Rajasthan
                </p>
              </div>
            </div>
          </div>

          {/* Hero Heading & Subtitle */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-lg">
              Greener Roads,<br className="hidden sm:inline" /> Brighter Rajasthan
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-200/90 max-w-xl font-normal leading-relaxed">
              Real-time intelligence and state-wide command console for a cleaner, smarter, and more connected electric bus fleet across Rajasthan.
            </p>
          </div>

          {/* 4 Feature Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col items-center text-center shadow-lg hover:border-emerald-400/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-1.5 text-emerald-300">
                <Bus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white leading-snug">
                Live Fleet Tracking
              </span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col items-center text-center shadow-lg hover:border-emerald-400/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-1.5 text-emerald-300">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white leading-snug">
                Smart Charging Network
              </span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col items-center text-center shadow-lg hover:border-emerald-400/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-1.5 text-emerald-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white leading-snug">
                Secure Officer Access
              </span>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/15 rounded-xl p-3 flex flex-col items-center text-center shadow-lg hover:border-emerald-400/50 transition-all">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-1.5 text-emerald-300">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-white leading-snug">
                Data-Driven Ops
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Floating Sign-In Card */}
        <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/80 flex flex-col justify-between space-y-5">
            {/* Top Row: State Badge + Rajasthan Watermark */}
            <div className="flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-wider text-emerald-900">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>STATE EV COMMAND CONSOLE</span>
              </div>
              <div className="w-14 h-10 relative flex items-center justify-center opacity-85">
                <img
                  src={rajasthanWatermark}
                  alt="Rajasthan India"
                  className="w-full h-full object-contain pointer-events-none select-none"
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Officer Portal Sign In
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-normal font-medium">
                Enter your authorized credentials to access the Yatra EV Fleet Operations Platform.
              </p>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="py-2.5 px-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-rose-600">error</span>
                <span className="truncate">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
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
                    className="w-full h-11 bg-slate-50/90 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all select-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
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
                    className="w-full h-11 bg-slate-50/90 border border-slate-200 rounded-xl pl-10 pr-10 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all select-text"
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
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 accent-emerald-600"
                  />
                  <span className="text-xs font-medium text-slate-700">Keep me signed in</span>
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Please contact Platform Admin for password reset.');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 hover:brightness-105 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

            <p className="text-[10px] text-slate-400 text-center font-medium">
              Authorized personnel only. All access is logged and audited under Rajasthan IT guidelines.
            </p>

            {/* Bottom Card Metrics */}
            <div className="grid grid-cols-4 gap-1 pt-3 border-t border-slate-100 text-center">
              <div className="flex flex-col items-center justify-center py-1">
                <Bus className="w-4 h-4 text-emerald-700 mb-0.5" />
                <div className="text-xs font-extrabold text-slate-900 leading-none">0+</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">EV Buses</div>
              </div>
              <div className="flex flex-col items-center justify-center py-1 border-l border-slate-100">
                <Leaf className="w-4 h-4 text-emerald-700 mb-0.5" />
                <div className="text-xs font-extrabold text-slate-900 leading-none">Cleaner</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">Cities</div>
              </div>
              <div className="flex flex-col items-center justify-center py-1 border-l border-slate-100">
                <Users className="w-4 h-4 text-emerald-700 mb-0.5" />
                <div className="text-xs font-extrabold text-slate-900 leading-none">Greener</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">Rajasthan</div>
              </div>
              <div className="flex flex-col items-center justify-center py-1 border-l border-slate-100">
                <TrendingUp className="w-4 h-4 text-emerald-700 mb-0.5" />
                <div className="text-xs font-extrabold text-slate-900 leading-none">Sustainable</div>
                <div className="text-[9px] text-slate-500 font-semibold mt-0.5">Future</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BOTTOM FOOTER: Eco Line & Rajasthan Hindi Slogan */}
      <footer className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-white/15 text-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <Leaf className="w-4 h-4 text-emerald-400" />
          <span>Swachh Parivahan | Samriddh Rajasthan</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-right">
          <span className="text-xs sm:text-sm font-bold text-emerald-300 tracking-wide font-serif italic">
            "चलो, एक हरित राजस्थान की ओर"
          </span>
          <span className="text-[10px] text-slate-300 font-medium tracking-wider uppercase">
            YATRA | EV Fleet Operations Platform • PEOPLE | PLANET | PROGRESS
          </span>
        </div>
      </footer>
    </div>
  );
}


