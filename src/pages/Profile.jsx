import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, User, Mail, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser, setAuthUser } = useAuthStore();
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
        const res = await axiosInstance.put("/users/update-profile", { profilePic: base64Image });
        // Assuming setAuthUser exists in useAuthStore to update local state
        // Let's add it if not, or update via checkAuth. Better yet, just useAuthStore.setState
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
    <div className="min-h-screen bg-background flex flex-col items-center pt-20 p-4">
      <div className="w-full max-w-2xl bg-surface rounded-2xl shadow-sm border border-gray-100 p-8 relative">
        <Link to="/" className="absolute top-8 left-8 text-textSecondary hover:text-primary transition-colors flex items-center gap-2 font-medium">
          <ArrowLeft className="w-5 h-5" />
          Back to Chat
        </Link>
        
        <div className="text-center mb-8 mt-12">
          <h1 className="text-3xl font-bold text-textPrimary">Profile</h1>
          <p className="text-textSecondary mt-2">Manage your account settings</p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-primary/10 overflow-hidden border-4 border-surface shadow-md">
              {authUser?.profilePic ? (
                <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary font-bold text-4xl">
                  {authUser?.fullName?.charAt(0)}
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className={`
                absolute bottom-0 right-0 
                bg-primary hover:bg-primaryDark
                p-2.5 rounded-full cursor-pointer 
                transition-all duration-200 shadow-lg text-white
                ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
              `}
            >
              {isUpdatingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
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
          <p className="text-sm text-textSecondary">
            {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
          </p>
        </div>

        <div className="space-y-6 mt-10">
          <div className="space-y-1.5">
            <div className="text-sm text-textSecondary flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </div>
            <p className="px-4 py-3 bg-background rounded-xl border border-gray-100 font-medium text-textPrimary">
              {authUser?.fullName}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-sm text-textSecondary flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <p className="px-4 py-3 bg-background rounded-xl border border-gray-100 font-medium text-textPrimary">
              {authUser?.email}
            </p>
          </div>
        </div>

        <div className="mt-8 bg-background rounded-xl p-6 border border-gray-100">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            Account Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-textSecondary">Member Since</span>
              <span className="font-medium text-textPrimary">{authUser?.createdAt?.split("T")[0]}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-textSecondary">Account Status</span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
