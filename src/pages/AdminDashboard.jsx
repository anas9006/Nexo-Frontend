import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Users, MessageSquare, Sparkles, ArrowLeft, Loader2 } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-surface rounded-full text-textSecondary hover:text-primary shadow-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-textPrimary">Admin Dashboard</h1>
            <p className="text-textSecondary">Overview of Nexo Chat platform</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Users Card */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <p className="text-textSecondary font-medium">Total Users</p>
                <h3 className="text-3xl font-bold text-textPrimary">{stats?.totalUsers || 0}</h3>
              </div>
            </div>

            {/* Total Messages Card */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7" />
              </div>
              <div>
                <p className="text-textSecondary font-medium">Total Messages</p>
                <h3 className="text-3xl font-bold text-textPrimary">{stats?.totalMessages || 0}</h3>
              </div>
            </div>

            {/* AI Interactions Card */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <p className="text-textSecondary font-medium">AI Interactions</p>
                <h3 className="text-3xl font-bold text-textPrimary">{stats?.aiMessages || 0}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Platform Health</h2>
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            All systems operational.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
