import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/firebase/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);

    try {
      await authService.resetPassword(email.trim());
      setIsSubmitted(true);
      toast.success('Reset Email Sent', 'Check your inbox for password reset instructions.');
    } catch (err: any) {
      toast.error('Error', err.message || 'Could not send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FC] dark:bg-[#0E1117] text-left">
      <div className="w-full max-w-md bg-white dark:bg-[#161A23] rounded-3xl border border-[#E9EAF0] dark:border-[#232838] p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#6857E8] text-white flex items-center justify-center font-extrabold text-lg">
              K
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#171923] dark:text-white">
              Knowbase AI
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white">
            Reset Password
          </h1>
          <p className="text-xs text-[#777D8A]">
            Enter your work email address and we will send you a password reset link.
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-5 rounded-2xl bg-[#ECFDF5] text-[#16A36A] dark:bg-[#064E3B]/30 border border-[#A7F3D0] space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <p className="text-xs font-semibold">
              Check your email at <span className="font-bold">{email}</span> for instructions to reset your password.
            </p>
            <Link to="/login" className="block pt-2">
              <Button size="sm" variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoFocus
            />

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-[#6857E8] hover:underline font-semibold inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

