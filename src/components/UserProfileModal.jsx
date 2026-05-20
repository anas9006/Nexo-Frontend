import { useState, useEffect } from "react";
import { X, Calendar, Mail, Shield } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ImageLightbox from "./ImageLightbox.jsx";

const UserProfileModal = ({ user, onClose }) => {
  const { onlineUsers } = useAuthStore();
  const [fullImage, setFullImage] = useState(null);
  const isOnline = onlineUsers.includes(user?._id);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Unknown";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex flex-col items-center pt-8 pb-5 px-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div
            className="w-20 h-20 rounded-full bg-primary/15 overflow-hidden mb-3 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all"
            onClick={() => user.profilePic && setFullImage(user.profilePic)}
          >
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                {user.fullName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold text-text-primary text-center">{user.fullName}</h2>

          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-text-secondary"}`} />
            <span className={`text-xs font-medium ${isOnline ? "text-success" : "text-text-secondary"}`}>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <div className="bg-background rounded-xl p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-text-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">Email</p>
                <p className="text-sm font-medium text-text-primary truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-text-secondary shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-text-secondary">Member since</p>
                <p className="text-sm font-medium text-text-primary">{memberSince}</p>
              </div>
            </div>

            {user.role === "admin" && (
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-text-secondary">Role</p>
                  <p className="text-sm font-medium text-primary">Admin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ImageLightbox src={fullImage} alt={`${user.fullName}'s profile`} onClose={() => setFullImage(null)} />
    </div>
  );
};

export default UserProfileModal;
