import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser } = useAuthStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setIsUpdatingProfile(true);
      try {
        const res = await axiosInstance.put("/users/update-profile", {
          profilePic: base64Image,
        });
        useAuthStore.setState({ authUser: res.data });
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to update profile");
      } finally {
        setIsUpdatingProfile(false);
      }
    };
  };

  return (
    <div className="min-h-[100dvh] bg-background overflow-y-auto nexo-scrollbar p-3 sm:p-4">
      <div className="w-full max-w-lg mx-auto nexo-panel p-4 sm:p-6 relative">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to chat
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your account</p>
        </div>

        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary/10 overflow-hidden border-4 border-surface shadow-md">
              {authUser?.profilePic ? (
                <img
                  src={authUser.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-primary font-bold text-3xl">
                  {authUser?.fullName?.charAt(0)}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className={`absolute bottom-0 right-0 bg-primary hover:bg-primary-dark p-2 rounded-full cursor-pointer transition-all shadow-lg text-white ${
                isUpdatingProfile ? "animate-pulse pointer-events-none" : ""
              }`}
            >
              {isUpdatingProfile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="text-xs text-text-secondary text-center">
            {isUpdatingProfile ? "Uploading…" : "Tap the camera to update your photo"}
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-xs text-text-secondary flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Full name
            </span>
            <p className="px-3 py-2.5 bg-background rounded-xl border border-border text-sm font-medium text-text-primary">
              {authUser?.fullName}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-text-secondary flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Email
            </span>
            <p className="px-3 py-2.5 bg-background rounded-xl border border-border text-sm font-medium text-text-primary break-all">
              {authUser?.email}
            </p>
          </div>
        </div>

        <div className="mt-6 bg-background rounded-xl p-4 border border-border">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Account</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border gap-2">
              <span className="text-text-secondary">Member since</span>
              <span className="font-medium text-text-primary">
                {authUser?.createdAt?.split("T")[0]}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-secondary">Status</span>
              <span className="text-success font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
