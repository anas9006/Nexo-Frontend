import { useEffect, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, messages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'unread', 'favorites'

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users.filter((user) => {
    // 1. Filter by search term
    if (searchTerm && !user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // 2. Filter by tab (mocking unread/favorites for now, all users show up in 'all')
    if (activeTab === "online" && !onlineUsers.includes(user._id)) {
        return false;
    }
    
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-surface">
      <div className="p-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-textPrimary">Messages</h2>
      </div>

      {/* Search Input */}
      <div className="px-4 pb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-textSecondary" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 bg-background border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-sm"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex px-4 gap-4 text-sm font-medium border-b border-gray-100">
        <button 
          onClick={() => setActiveTab("all")}
          className={`pb-2 transition-colors ${activeTab === "all" ? "text-primary border-b-2 border-primary" : "text-textSecondary hover:text-textPrimary"}`}
        >
          All messages
        </button>
        <button 
          onClick={() => setActiveTab("online")}
          className={`pb-2 transition-colors ${activeTab === "online" ? "text-primary border-b-2 border-primary" : "text-textSecondary hover:text-textPrimary"}`}
        >
          Online
        </button>
      </div>

      <div className="p-4">
        <button 
          onClick={() => setSelectedUser(null)}
          className={`w-full ${selectedUser === null ? 'bg-primaryDark' : 'bg-primary'} hover:bg-primaryDark text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium shadow-sm transition-colors`}
        >
          <Sparkles className="w-4 h-4" />
          Chat smarter with Nexo AI!
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isUsersLoading ? (
          <div className="p-4 text-center text-textSecondary text-sm">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-textSecondary text-sm">No users found.</div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-background transition-colors ${selectedUser?._id === user._id ? 'bg-background' : ''}`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary/20 overflow-hidden">
                  {user.profilePic ? (
                    <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></span>
                )}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-medium text-textPrimary truncate">{user.fullName}</div>
                <div className="text-xs text-textSecondary truncate">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
              
              {/* Mock Unread Badge for demo purposes */}
              {user._id.length % 2 === 0 && !onlineUsers.includes(user._id) && selectedUser?._id !== user._id && (
                <div className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  1
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
