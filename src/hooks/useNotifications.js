import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { playNotificationSound } from "../lib/notificationSound";

const requestPermission = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
};

export const useNotifications = () => {
  const authUser = useAuthStore((s) => s.authUser);
  const socket = useAuthStore((s) => s.socket);
  const selectedUser = useChatStore((s) => s.selectedUser);
  const previousMessageCount = useRef(0);

  useEffect(() => {
    if (authUser?.settings?.notifications) {
      requestPermission();
    }
  }, [authUser?.settings?.notifications]);

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleNewMessage = (newMessage) => {
      const senderId = newMessage.senderId?._id ?? newMessage.senderId;
      const isFromSelected = String(senderId) === String(selectedUser?._id);

      const notify = authUser?.settings?.notifications !== false;
      const sound = authUser?.settings?.sound !== false;

      if (sound && !isFromSelected) {
        playNotificationSound();
      }

      if (notify && !isFromSelected && "Notification" in window && Notification.permission === "granted") {
        const senderName = newMessage.senderId?.fullName || "Someone";
        const preview = newMessage.text || (newMessage.image ? "Sent an image" : newMessage.audio ? "Sent a voice message" : "Sent a message");
        new Notification(senderName, {
          body: preview,
          icon: newMessage.senderId?.profilePic || undefined,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, authUser, selectedUser]);
};
