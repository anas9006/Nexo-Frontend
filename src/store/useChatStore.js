import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  hasMoreMessages: false,
  messagesPage: 1,
  messagesTotal: 0,

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
    set({ isMessagesLoading: true, messages: [], messagesPage: 1, hasMoreMessages: false, messagesTotal: 0 });
    try {
      const res = await axiosInstance.get(`/messages/${userId}?page=1&limit=50`);
      const data = res.data;
      set({
        messages: data.messages,
        hasMoreMessages: data.hasMore,
        messagesPage: 1,
        messagesTotal: data.total,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  loadMoreMessages: async () => {
    const { selectedUser, messagesPage } = get();
    if (!selectedUser) return;

    const nextPage = messagesPage + 1;
    try {
      const res = await axiosInstance.get(`/messages/${selectedUser._id}?page=${nextPage}&limit=50`);
      const data = res.data;
      set({
        messages: [...data.messages, ...get().messages],
        hasMoreMessages: data.hasMore,
        messagesPage: nextPage,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load more messages");
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

  sendAiMessage: async (payload) => {
    const { messages } = get();
    const { text, image, audio } = payload;
    const tempUserMessage = {
      _id: Date.now(),
      text: text || "",
      image: image || undefined,
      audio: audio || undefined,
      senderId: useAuthStore.getState().authUser._id,
      isAiResponse: false,
      createdAt: new Date().toISOString(),
    };
    set({ messages: [...messages, tempUserMessage] });

    try {
      const res = await axiosInstance.post("/ai/chat", {
        message: text || "",
        image: image || undefined,
        audio: audio || undefined,
      });
      set({ messages: [...messages, res.data.userMessage, res.data.aiMessage] });
    } catch (error) {
      const data = error.response?.data;
      const hint =
        data?.details != null && data?.error != null
          ? `${data.error} ${data.details}`
          : data?.error || data?.details;
      toast.error(hint || "Failed to get AI response");
      set({ messages: messages });
    }
  },

  editMessage: async ({ messageId, newText }) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageId}`, { text: newText });
      set({ messages: get().messages.map((m) => (m._id === messageId ? res.data : m)) });
      toast.success("Message updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to edit message");
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

    const onNewMessage = (newMessage) => {
      const senderId = newMessage.senderId?._id ?? newMessage.senderId;
      if (String(senderId) !== String(selectedUser._id)) return;

      const exists = get().messages.some(
        (m) => String(m._id) === String(newMessage._id)
      );
      if (exists) return;

      set({
        messages: [...get().messages, newMessage],
      });
    };

    const onMessageDeleted = (messageId) => {
      set({ messages: get().messages.filter(msg => msg._id !== messageId) });
    };

    const onMessageEdited = (editedMessage) => {
      set({ messages: get().messages.map((m) => (m._id === editedMessage._id ? editedMessage : m)) });
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("messageEdited", onMessageEdited);

    set({ _messageListeners: { onNewMessage, onMessageDeleted, onMessageEdited } });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { _messageListeners } = get();
    if (_messageListeners) {
      socket.off("newMessage", _messageListeners.onNewMessage);
      socket.off("messageDeleted", _messageListeners.onMessageDeleted);
      socket.off("messageEdited", _messageListeners.onMessageEdited);
      set({ _messageListeners: null });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
