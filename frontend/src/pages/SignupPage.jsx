import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { UserPlus, Eye, EyeOff, ArrowRight, User, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'USER',
  });
  const [showPassword, setShowPassword] = useState(false);
  const { signup, loading, isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'ADMIN') navigate('/admin', { replace: true });
      else if (user?.role === 'PROVIDER') navigate('/provider/dashboard', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      toast.success('Account created successfully!');
      navigate(form.role === 'PROVIDER' ? '/provider/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-surface-50">
      <div className="absolute top-1/3 -right-32 w-72 h-72 bg-primary-200/50 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/3 -left-32 w-64 h-64 bg-secondary-200/40 rounded-full blur-3xl animate-pulse-soft" />

      <div className="bg-white border border-surface-200 shadow-xl rounded-3xl p-8 max-w-md w-full relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/25">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2">Create Account</h1>
          <p className="text-surface-600">Join ServeConnect today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-bold text-surface-700 mb-3">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'USER' })}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
                  form.role === 'USER'
                    ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                    : 'border-surface-200 bg-surface-50 text-surface-600 hover:border-primary-300'
                }`}
              >
                <User size={24} className="mb-2" />
                <span className="text-sm font-bold">Find Services</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'PROVIDER' })}
                className={`flex flex-col items-center p-4 rounded-xl border transition-all duration-300 ${
                  form.role === 'PROVIDER'
                    ? 'border-secondary-500 bg-secondary-50 text-secondary-700 shadow-sm'
                    : 'border-surface-200 bg-surface-50 text-surface-600 hover:border-secondary-300'
                }`}
              >
                <Wrench size={24} className="mb-2" />
                <span className="text-sm font-bold">Offer Services</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-2">Full Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-2">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-surface-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center space-x-2">
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-surface-500 mt-6 text-sm font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
