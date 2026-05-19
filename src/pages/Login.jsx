import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { MessageSquare, Mail, Lock, EyeOff, Eye, Loader2 } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">Welcome Back</h1>
          <p className="text-textSecondary mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-textSecondary" />
              </div>
              <input
                type="email"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-textSecondary mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-textSecondary" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-textSecondary hover:text-textPrimary" />
                ) : (
                  <Eye className="h-5 w-5 text-textSecondary hover:text-textPrimary" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-textSecondary">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:text-primaryDark">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
