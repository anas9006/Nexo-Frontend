import { useEffect, useState } from "react";
import { Search, Sparkles, CheckCheck } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
};

const getLastMessagePreview = (lastMessage, authUserId) => {
  if (!lastMessage) return "";
  const isMine = String(lastMessage.senderId) === String(authUserId);
  const prefix = isMine ? "You: " : "";
  if (lastMessage.text) return `${prefix}${lastMessage.text}`;
  if (lastMessage.image) return `${prefix}📷 Photo`;
  if (lastMessage.audio) return `${prefix}🎤 Voice`;
  return `${prefix}Message`;
};

const Sidebar = ({ onConversationSelect, searchTerm: externalSearchTerm = "" }) => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { authUser, onlineUsers, socket } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");

  const effectiveSearchTerm = externalSearchTerm || searchTerm;
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => getUsers();
    socket.on("newMessage", refresh);
    socket.on("messageEdited", refresh);
    socket.on("messageDeleted", refresh);
    socket.on("userUpdated", refresh);
    socket.on("userDeleted", refresh);
    return () => {
      socket.off("newMessage", refresh);
      socket.off("messageEdited", refresh);
      socket.off("messageDeleted", refresh);
      socket.off("userUpdated", refresh);
      socket.off("userDeleted", refresh);
    };
  }, [socket, getUsers]);

  const selectConversation = (user) => {
    setSelectedUser(user);
    onConversationSelect?.();
    getUsers();
  };

  const filteredUsers = users.filter((user) => {
    if (
      effectiveSearchTerm &&
      !user.fullName.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
    ) {
      return false;
    }
    if (activeTab === "online" && !onlineUsers.includes(user._id)) {
      return false;
    }
    if (activeTab === "unread" && (!user.unreadCount || user.unreadCount === 0)) {
      return false;
    }
    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-surface min-h-0">
      <div className="px-3 pt-3 pb-2 shrink-0">
        <h2 className="text-sm font-bold text-text-primary">Messages</h2>
      </div>

      <div className="px-3 pb-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
          <input
            type="text"
            className="nexo-input pl-8 py-1.5 text-xs sm:text-sm"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex px-3 gap-3 text-xs font-medium border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`pb-2 transition-colors ${
            activeTab === "all"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`pb-2 transition-colors ${
            activeTab === "unread"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Unread
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("online")}
          className={`pb-2 transition-colors ${
            activeTab === "online"
              ? "text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Online
        </button>
      </div>

      <div className="p-2 sm:p-3 shrink-0">
        <button
          type="button"
          onClick={() => selectConversation(null)}
          className={`w-full text-white py-2 sm:py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium transition-colors ${
            selectedUser === null
              ? "bg-primary-dark"
              : "bg-primary hover:bg-primary-dark"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Nexo AI</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto nexo-scrollbar min-h-0">
        {isUsersLoading ? (
          <p className="p-3 text-center text-text-secondary text-xs">
            Loading users...
          </p>
        ) : filteredUsers.length === 0 ? (
          <p className="p-3 text-center text-text-secondary text-xs">
            No users found.
          </p>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user._id}
              type="button"
              onClick={() => selectConversation(user)}
              className={`w-full px-2 sm:px-3 py-2.5 flex items-center gap-2.5 hover:bg-background transition-colors ${
                selectedUser?._id === user._id ? "bg-background" : ""
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/15 overflow-hidden">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">
                      {user.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-surface" />
                )}
              </div>

              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <p className="font-medium text-sm text-text-primary truncate">
                    {user.fullName}
                  </p>
                  {user.lastMessage && (
                    <span className="text-[10px] text-text-secondary shrink-0 leading-none">
                      {formatTime(user.lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                  {user.lastMessage && String(user.lastMessage.senderId) === String(authUser?._id) && (
                    <CheckCheck className={`w-3.5 h-3.5 shrink-0 ${user.lastMessage.read ? "text-primary" : "text-textSecondary"}`} />
                  )}
                  <p className="text-[11px] text-text-secondary truncate flex-1 text-left">
                    {user.lastMessage
                      ? getLastMessagePreview(user.lastMessage, authUser?._id)
                      : "Start a conversation"}
                  </p>
                  {user.unreadCount > 0 && (
                    <span className="bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 leading-none shrink-0">
                      {user.unreadCount > 99 ? "99+" : user.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
