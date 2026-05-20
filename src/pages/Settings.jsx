import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Moon, Sun, Bell, BellOff, Volume2, VolumeX,
  Lock, Eye, EyeOff, UserX, Trash2, Pencil, Check, X,
  Loader2, User, ShieldBan, ArrowLeft,
} from "lucide-react";

const Settings = () => {
  const { authUser, setAuthUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [savingSetting, setSavingSetting] = useState(null);

  const [settings, setSettings] = useState({
    darkMode: authUser?.settings?.darkMode || false,
    notifications: authUser?.settings?.notifications !== false,
    sound: authUser?.settings?.sound !== false,
    privacy: authUser?.settings?.privacy || "public",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  /* ── Name editing ── */
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(authUser?.fullName || "");

  const handleSaveName = async () => {
    if (!nameDraft.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    if (nameDraft.trim() === authUser?.fullName) {
      setEditingName(false);
      return;
    }
    setSavingSetting("name");
    try {
      const res = await axiosInstance.put("/users/update-name", { fullName: nameDraft.trim() });
      setAuthUser(res.data);
      toast.success("Name updated");
      setEditingName(false);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update name");
      setNameDraft(authUser?.fullName || "");
    } finally {
      setSavingSetting(null);
    }
  };

  /* ── Blocked users ── */
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [showBlockedSection, setShowBlockedSection] = useState(false);

  const fetchBlockedUsers = async () => {
    setBlockedUsersLoading(true);
    try {
      const res = await axiosInstance.get("/users/blocked");
      setBlockedUsers(res.data);
    } catch (error) {
      toast.error("Failed to load blocked users");
    } finally {
      setBlockedUsersLoading(false);
    }
  };

  const handleUnblock = async (userIdToUnblock) => {
    try {
      const res = await axiosInstance.post("/users/block", { userIdToBlock: userIdToUnblock });
      setBlockedUsers((prev) => prev.filter((u) => u._id !== userIdToUnblock));
      setAuthUser({ ...authUser, blockedUsers: res.data.blockedUsers });
      toast.success("User unblocked");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to unblock user");
    }
  };

  useEffect(() => {
    if (showBlockedSection && blockedUsers.length === 0 && !blockedUsersLoading) {
      fetchBlockedUsers();
    }
  }, [showBlockedSection]);

  const toggleBlockedSection = () => {
    setShowBlockedSection((prev) => !prev);
  };

  /* ── Settings toggle ── */
  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setSavingSetting(key);

    try {
      await axiosInstance.put("/users/settings", newSettings);
      setAuthUser({ ...authUser, settings: newSettings });
      toast.success("Settings updated");
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
      setSettings(settings);
    } finally {
      setSavingSetting(null);
    }
  };

  /* ── Password ── */
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.put("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(error.response?.data?.error || "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error("Please enter your password");
      return;
    }

    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    setIsLoading(true);
    try {
      await axiosInstance.delete("/users/delete-account", {
        data: { password: deletePassword },
      });
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error(error.response?.data?.error || "Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSwitch = (key, value, label) => (
    <button
      onClick={() => handleSettingChange(key, !value)}
      disabled={savingSetting === key}
      className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${value ? "bg-primary" : "bg-border"} ${savingSetting === key ? "opacity-50" : ""}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );

  const passwordField = (label, key, value) => (
    <div className="relative">
      <input
        type={showPassword[key] ? "text" : "password"}
        placeholder={label}
        value={value}
        onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
        required
      />
      <button
        type="button"
        onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
      >
        {showPassword[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <div className="h-dvh bg-background overflow-y-auto nexo-scrollbar p-3 sm:p-4">
      <div className="w-full max-w-lg mx-auto space-y-4">
        <div className="nexo-panel p-4 sm:p-6">
          <div className="relative text-center mb-6">
            <Link
              to="/"
              className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-background transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Settings</h1>
            <p className="text-text-secondary text-sm mt-1">Account preferences</p>
          </div>

          <div className="space-y-4">
            {/* ── Profile ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3">Profile</h2>
              <div className="text-sm space-y-3">
                <div>
                  <span className="text-xs text-text-secondary block mb-1">Full Name</span>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveName();
                          if (e.key === "Escape") { setEditingName(false); setNameDraft(authUser?.fullName || ""); }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSaveName}
                        disabled={savingSetting === "name"}
                        className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
                      >
                        {savingSetting === "name" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditingName(false); setNameDraft(authUser?.fullName || ""); }}
                        className="p-2 rounded-lg bg-background border border-border text-text-secondary hover:text-text-primary transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary">{authUser?.fullName}</span>
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-xs text-text-secondary block mb-1">Email</span>
                  <p className="font-medium text-text-primary break-all">{authUser?.email}</p>
                </div>
              </div>
            </div>

            {/* ── Appearance ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3">Appearance</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                  <span className="text-sm text-text-secondary">Dark Mode</span>
                </div>
                {toggleSwitch("darkMode", settings.darkMode)}
              </div>
            </div>

            {/* ── Notifications & Sound ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3">Notifications & Sound</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.notifications ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-text-secondary" />}
                    <span className="text-sm text-text-secondary">Notifications</span>
                  </div>
                  {toggleSwitch("notifications", settings.notifications)}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {settings.sound ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4 text-text-secondary" />}
                    <span className="text-sm text-text-secondary">Sound</span>
                  </div>
                  {toggleSwitch("sound", settings.sound)}
                </div>
              </div>
            </div>

            {/* ── Privacy ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3">Privacy</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.privacy === "public" ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-text-secondary" />}
                  <span className="text-sm text-text-secondary">Profile Visibility</span>
                </div>
                <select
                  value={settings.privacy}
                  onChange={(e) => handleSettingChange("privacy", e.target.value)}
                  className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            {/* ── Change Password ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Change Password
              </h2>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                {passwordField("Current Password", "current", passwordForm.currentPassword)}
                {passwordField("New Password", "new", passwordForm.newPassword)}
                {passwordField("Confirm New Password", "confirm", passwordForm.confirmPassword)}
                <button
                  type="submit"
                  disabled={isLoading || savingSetting}
                  className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>

            {/* ── Blocked Users ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <button
                type="button"
                onClick={toggleBlockedSection}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <UserX className="w-4 h-4" /> Blocked Users
                </h2>
                <span className="text-xs text-text-secondary bg-surface border border-border rounded-full px-2 py-0.5">
                  {authUser?.blockedUsers?.length || 0}
                </span>
              </button>

              {showBlockedSection && (
                <div className="mt-3 space-y-2">
                  {blockedUsersLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    </div>
                  ) : blockedUsers.length === 0 ? (
                    <p className="text-sm text-text-secondary text-center py-3">
                      No blocked users
                    </p>
                  ) : (
                    blockedUsers.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-2.5 bg-surface rounded-xl border border-border"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{user.fullName}</p>
                            <p className="text-xs text-text-secondary truncate">{user.email}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUnblock(user._id)}
                          className="text-xs font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          Unblock
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* ── Delete Account ── */}
            <div className="bg-background rounded-xl p-4 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2 text-danger">
                <Trash2 className="w-4 h-4" /> Delete Account
              </h2>
              <p className="text-sm text-text-secondary mb-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    placeholder="Enter your password to confirm"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
                  >
                    {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isLoading || savingSetting || !deletePassword}
                  className="w-full bg-danger hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
