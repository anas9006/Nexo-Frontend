import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null, // If null, user is in AI chat
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  getAiMessages: async () => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get("/ai/messages");
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch AI messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    set({ isSendingMessage: true });
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      const data = error.response?.data;
      const hint =
        data?.details != null && data?.error != null
          ? `${data.error} ${data.details}`
          : data?.error || data?.message;
      toast.error(hint || "Failed to send message");
      throw error;
    } finally {
      set({ isSendingMessage: false });
    }
  },

  sendAiMessage: async (text) => {
    const { messages } = get();
    // Optimistic UI for AI
    const tempUserMessage = { _id: Date.now(), text, senderId: useAuthStore.getState().authUser._id, isAiResponse: false, createdAt: new Date().toISOString() };
    set({ messages: [...messages, tempUserMessage] });

    try {
      const res = await axiosInstance.post("/ai/chat", { message: text });
      // API returns both userMessage and aiMessage saved in DB
      set({ messages: [...messages, res.data.userMessage, res.data.aiMessage] });
    } catch (error) {
      const data = error.response?.data;
      const hint =
        data?.details != null && data?.error != null
          ? `${data.error} ${data.details}`
          : data?.error || data?.details;
      toast.error(hint || "Failed to get AI response");
      // Remove optimistic message if failed
      set({ messages: messages });
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({ messages: get().messages.filter(msg => msg._id !== messageId) });
      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const senderId = newMessage.senderId?._id ?? newMessage.senderId;
      if (String(senderId) !== String(selectedUser._id)) return;

      const exists = get().messages.some(
        (m) => String(m._id) === String(newMessage._id)
      );
      if (exists) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("messageDeleted", (messageId) => {
      set({ messages: get().messages.filter(msg => msg._id !== messageId) });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
