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
    <div className="min-h-[100dvh] bg-background overflow-y-auto nexo-scrollbar p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <Link
            to="/"
            className="p-2 bg-surface rounded-full text-text-secondary hover:text-primary border border-border transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary truncate">
              Admin dashboard
            </h1>
            <p className="text-text-secondary text-xs sm:text-sm">Nexo Chat overview</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              icon={Users}
              label="Total users"
              value={stats?.totalUsers || 0}
              tone="primary"
            />
            <StatCard
              icon={MessageSquare}
              label="Total messages"
              value={stats?.totalMessages || 0}
              tone="primary"
            />
            <StatCard
              icon={Sparkles}
              label="AI interactions"
              value={stats?.aiMessages || 0}
              tone="accent"
            />
          </div>
        )}

        <div className="mt-4 sm:mt-6 nexo-panel p-4 sm:p-5">
          <h2 className="text-base font-bold text-text-primary mb-3">Platform health</h2>
          <div className="p-3 bg-primary-light border border-primary/20 rounded-xl text-primary flex items-center gap-2 text-sm">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse shrink-0" />
            All systems operational.
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ icon: Icon, label, value, tone }) {
  const iconWrap =
    tone === "accent"
      ? "bg-primary/10 text-primary"
      : "bg-primary/10 text-primary";

  return (
    <div className="nexo-panel p-4 flex items-center gap-3 sm:gap-4">
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${iconWrap}`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-text-secondary text-xs sm:text-sm font-medium">{label}</p>
        <h3 className="text-2xl sm:text-3xl font-bold text-text-primary">{value}</h3>
      </div>
    </div>
  );
}

export default AdminDashboard;
