import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useApp } from '../App';
import { toast } from 'sonner';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, API } = useApp();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignup ? '/auth/signup' : '/auth/login';
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        login(data.access_token, data.user);
        toast.success(`Welcome ${data.user.full_name}!`);
        navigate('/admin/dashboard');
      } else {
        toast.error(data.detail || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>

        <div className="bg-surface p-8 rounded-xl border border-white/10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isSignup ? 'Create Admin Account' : 'Admin Login'}
            </h1>
            <p className="text-muted-foreground">
              {isSignup ? 'Register to manage your cafe' : 'Access your dashboard'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div>
                <Label htmlFor="full_name" className="text-foreground mb-2 block">Full Name</Label>
                <Input
                  id="full_name"
                  data-testid="full-name-input"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required={isSignup}
                  className="bg-muted border-transparent focus:border-primary text-foreground"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-foreground mb-2 block">Email</Label>
              <Input
                id="email"
                data-testid="email-input"
                type="email"
                placeholder="admin@dkpizza.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-muted border-transparent focus:border-primary text-foreground"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-foreground mb-2 block">Password</Label>
              <Input
                id="password"
                data-testid="password-input"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="bg-muted border-transparent focus:border-primary text-foreground"
              />
            </div>

            <Button
              type="submit"
              data-testid="auth-submit-btn"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-lg font-bold shadow-lg"
            >
              {loading ? (
                'Please wait...'
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {isSignup ? 'Sign Up' : 'Log In'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="toggle-auth-mode"
              onClick={() => setIsSignup(!isSignup)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignup
                ? 'Already have an account? Log in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
