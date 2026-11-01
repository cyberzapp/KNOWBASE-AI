import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const SignupPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signup, loginWithGoogle } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (password.length < 6) {
      toast.error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mismatch', 'Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      toast.error('Terms required', 'Please accept the Terms of Service.');
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, fullName);
      toast.success('Account Created', 'Welcome to Knowbase AI. Launching onboarding...');
      navigate('/onboarding');
    } catch (err: any) {
      toast.error('Sign Up Failed', err.message || 'Could not register account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Account Registered', 'Welcome to Knowbase AI.');
      navigate('/onboarding');
    } catch (err: any) {
      toast.error('Registration Failed', err.message || 'Google signup failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FC] dark:bg-[#0E1117] text-left">
      <div className="w-full max-w-md bg-white dark:bg-[#161A23] rounded-3xl border border-[#E9EAF0] dark:border-[#232838] p-8 shadow-xl space-y-6">
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
            Create your workspace
          </h1>
          <p className="text-xs text-[#777D8A] dark:text-[#9BA1B0]">
            Get started with 25 free documents and grounded AI citations
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[#E9EAF0] dark:border-[#232838] bg-white dark:bg-[#1A1F2C] text-xs font-semibold text-[#171923] dark:text-white hover:bg-[#F8F9FC] dark:hover:bg-[#202636] transition-all shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E9EAF0] dark:border-[#232838]" />
          <span className="text-[11px] uppercase tracking-wider text-[#777D8A]">or sign up with email</span>
          <div className="flex-1 h-px bg-[#E9EAF0] dark:border-[#232838]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Alex Morgan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Work Email"
            type="email"
            placeholder="alex@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

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

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="flex items-start gap-2 pt-1 text-xs text-[#777D8A]">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded text-[#6857E8] focus:ring-[#6857E8] accent-[#6857E8]"
              required
            />
            <label htmlFor="terms" className="leading-tight">
              I agree to the <Link to="/terms" className="text-[#6857E8] underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#6857E8] underline">Privacy Policy</Link>.
            </label>
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Free Account
          </Button>
        </form>

        <p className="text-center text-xs text-[#777D8A]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#6857E8] font-bold hover:underline">
            Sign in &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
};

