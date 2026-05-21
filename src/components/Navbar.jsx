import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  MessageSquare,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  PanelLeft,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

const Navbar = ({ onOpenSidebar, showSidebarToggle = false, searchTerm = "", onSearchChange }) => {
  const { authUser, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-11 sm:h-12 flex items-center justify-between px-2 sm:px-4 bg-surface border-b border-border shrink-0 z-20">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {showSidebarToggle && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="nexo-icon-btn md:hidden"
            aria-label="Open conversations"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-primary font-bold text-base sm:text-lg">N</span>
        </div>
        <span className="font-bold text-base sm:text-lg text-text-primary truncate">
          Nexo
        </span>
      </div>

      <div className="hidden sm:flex flex-1 max-w-xs lg:max-w-md mx-3 min-w-0">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
          <input
            type="text"
            className="nexo-input pl-9 py-1.5 text-sm rounded-full border-transparent bg-background"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <div className="relative hidden sm:flex">
          <button type="button" className="nexo-icon-btn relative" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-surface" />
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-1 w-72 bg-surface rounded-xl shadow-lg border border-border py-3 z-50">
                <div className="flex items-center justify-between px-3 pb-2 border-b border-border">
                  <span className="text-sm font-semibold text-text-primary">Notifications</span>
                  <button type="button" onClick={() => setShowNotifications(false)} className="text-text-secondary hover:text-text-primary">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-text-secondary text-center py-4">No new notifications</p>
              </div>
            </>
          )}
        </div>
        <button type="button" className="nexo-icon-btn hidden md:flex" onClick={() => console.log("Open conversations")}>
          <MessageSquare className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/15 overflow-hidden ml-1 ring-2 ring-transparent hover:ring-primary/30 transition-all"
          >
            {authUser?.profilePic ? (
              <img
                src={authUser.profilePic}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-primary font-semibold text-sm">
                {authUser?.fullName?.charAt(0)}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 sm:w-48 bg-surface rounded-xl shadow-lg border border-border py-1 z-50">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium text-text-primary truncate">
                  {authUser?.fullName}
                </p>
                <p className="text-xs text-text-secondary truncate">
                  {authUser?.email}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary"
              >
                <User className="w-4 h-4" /> Profile
              </Link>

              {authUser?.role === "admin" && (
                <Link
                  to="/admin"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin
                </Link>
              )}

              <Link
                to="/settings"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-background hover:text-text-primary"
              >
                <Settings className="w-4 h-4" /> Settings
              </Link>

              <div className="border-t border-border mt-0.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-primary-light text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
