import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Bot, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back', 'Signed in successfully.');
      navigate('/app');
    } catch (err: any) {
      toast.error('Sign In Failed', err.message || 'Please check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Signed in with Google', 'Welcome to Knowbase AI.');
      navigate('/app');
    } catch (err: any) {
      toast.error('Sign In Failed', err.message || 'Google authentication interrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FC] dark:bg-[#0E1117] text-left">
      <div className="w-full max-w-md bg-white dark:bg-[#161A23] rounded-3xl border border-[#E9EAF0] dark:border-[#232838] p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#6857E8] text-white flex items-center justify-center font-extrabold text-lg shadow-sm shadow-[#6857E8]/30">
              K
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#171923] dark:text-white">
              Knowbase AI
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0]">
            Sign in to access your company knowledge workspace
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E9EAF0] dark:border-[#232838] bg-white dark:bg-[#1A1F2C] text-xs font-semibold text-[#171923] dark:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#202636] transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E9EAF0] dark:border-[#232838]" />
          <span className="text-[11px] uppercase tracking-wider text-[#777D8A]">or with work email</span>
          <div className="flex-1 h-px bg-[#E9EAF0] dark:border-[#232838]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-[#171923] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-[#6857E8] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign in to Workspace
          </Button>
        </form>

        <p className="text-center text-xs text-[#777D8A]">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-[#6857E8] font-bold hover:underline">
            Create account &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
};

