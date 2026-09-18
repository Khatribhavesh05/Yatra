import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Zap, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.response?.data?.detail || err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-urja-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-urja-surface border border-urja-border rounded-2xl shadow-sm hover:shadow hover:border-urja-green-border hover:-translate-y-1 transition-all duration-200 shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/urja-logo-darkmode.svg"
            alt="URJA Logo"
            className="h-14 w-auto mb-3 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/urja-logo-darkmode.png';
            }}
          />
          <h1 className="text-xl font-bold text-urja-text">URJA Fleet Command</h1>
          <p className="text-xs font-semibold tracking-widest text-urja-primary mt-1">SUPER ADMIN PORTAL</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-urja-danger/10 border border-urja-danger/20 rounded-lg text-urja-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-urja-text-secondary mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-urja-bg border border-urja-border rounded-lg px-4 py-3 text-urja-text placeholder-slate-600 focus:outline-none focus:border-urja-primary focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="admin@urja.gov.in"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-urja-text-secondary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-urja-bg border border-urja-border rounded-lg px-4 py-3 text-urja-text placeholder-slate-600 focus:outline-none focus:border-urja-primary focus:ring-1 focus:ring-emerald-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-urja-primary hover:bg-emerald-500 text-white rounded-lg px-4 py-3 font-medium flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
