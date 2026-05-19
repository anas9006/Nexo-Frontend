import { useState, useRef, useEffect } from "react";
import { Search, Bell, MessageSquare, LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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
    <div className="h-16 flex items-center justify-between px-6 bg-surface shadow-sm relative z-20 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-xl">N</span>
        </div>
        <span className="font-bold text-xl text-textPrimary hidden sm:block">Nexo</span>
      </div>

      {/* Search Bar - Mock for global search */}
      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-textSecondary" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-background border-none rounded-full focus:ring-2 focus:ring-primary focus:bg-surface outline-none transition-all text-sm"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-textSecondary hover:text-textPrimary transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-surface"></span>
        </button>
        <button className="p-2 text-textSecondary hover:text-textPrimary transition-colors">
          <MessageSquare className="w-5 h-5" />
        </button>
        
        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-8 h-8 rounded-full bg-primary/20 overflow-hidden cursor-pointer ml-2 hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all focus:outline-none"
          >
            {authUser?.profilePic ? (
              <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                {authUser?.fullName?.charAt(0)}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg py-2 border border-gray-100 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-textPrimary truncate">{authUser?.fullName}</p>
                <p className="text-xs text-textSecondary truncate">{authUser?.email}</p>
              </div>
              
              <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-textPrimary transition-colors">
                <User className="w-4 h-4" /> Profile
              </Link>
              
              <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-textPrimary transition-colors">
                <ShieldCheck className="w-4 h-4" /> Admin Dashboard
              </Link>
              
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-textSecondary hover:bg-background hover:text-textPrimary transition-colors text-left">
                <Settings className="w-4 h-4" /> Settings
              </button>
              
              <div className="border-t border-gray-100 mt-1 pt-1">
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
