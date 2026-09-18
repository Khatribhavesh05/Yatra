import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/charging/operator');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/charging/operator');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.detail || 'Invalid email or password. Please check your official credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-gutter bg-surface">
      <div className="w-full max-w-md bg-white rounded-2xl border border-outline-variant p-8 shadow-xl">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <img
              src="/urja-logo.svg"
              alt="URJA Logo"
              className="h-12 w-auto mx-auto object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/urja-logo.png';
              }}
            />
          </Link>
          <h1 className="font-display-lg text-2xl font-bold text-on-background">
            Operator & Official Access
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1">
            Authorized portal for URJA EV Charging Station Operators, Dispatchers, and Municipal Admins.
          </p>
        </div>

        {/* Public Note */}
        <div className="mb-6 p-3 rounded-lg bg-secondary-container/40 border border-secondary/30 text-xs text-secondary flex items-start gap-2">
          <span className="material-symbols-outlined text-base shrink-0">info</span>
          <div>
            <strong>Are you a citizen or commuter?</strong> No login is required. You can track buses and find charging centers freely on the public map.
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Official Email Address"
            type="email"
            placeholder="operator@fleetiq.gov.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon="mail"
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon="lock"
            required
          />

          <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-outline-variant text-primary" />
              <span>Remember this session</span>
            </label>
            <Link to="/help" className="text-primary font-bold hover:underline">
              Need help?
            </Link>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              loading={loading}
              icon="login"
            >
              Sign In to Operator Console
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
