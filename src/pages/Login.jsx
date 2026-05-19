import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageSquare, Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background p-3 sm:p-4">
      <div className="w-full max-w-sm nexo-panel p-5 sm:p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-text-secondary text-sm mt-1">Sign in to Nexo Chat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="email"
                className="nexo-input pl-9 py-2.5"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type={showPassword ? "text" : "password"}
                className="nexo-input pl-9 pr-10 py-2.5"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-text-secondary hover:text-text-primary" />
                ) : (
                  <Eye className="h-4 w-4 text-text-secondary hover:text-text-primary" />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={isLoggingIn} className="nexo-btn-primary w-full py-2.5">
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-text-secondary">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
