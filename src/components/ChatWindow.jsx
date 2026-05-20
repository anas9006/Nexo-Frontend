import { useEffect, useRef, useState } from "react";
import {
  Sparkles, Gift, MoreHorizontal, Image as ImageIcon,
  Mic, Send, Loader2, X, Square, Trash2, Bot, CheckCheck, ChevronLeft, Pencil, Undo2,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { compressImageFile, blobToUploadDataURL } from "../lib/media.js";
import ImageLightbox from "./ImageLightbox.jsx";
import UserProfileModal from "./UserProfileModal.jsx";

/* ─────────────────────────────────────────────
   All colors intentionally use the ORIGINAL
   Tailwind tokens: bg-primary, bg-surface,
   bg-background, text-text-primary,
   text-text-secondary, hover:bg-primary-dark
   — zero custom hex values introduced.
───────────────────────────────────────────── */

/* ── Avatar ── */
const Avatar = ({ user, size = 36, isAi = false, onClick }) => {
  const dim = { width: size, height: size };
  const wrap = (children) => {
    if (onClick) {
      return (
        <button type="button" onClick={onClick} className="rounded-full flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50" style={dim}>
          {children}
        </button>
      );
    }
    return children;
  };
  if (isAi) {
    return wrap(
      <div className="rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0" style={dim}>
        <Bot className="text-primary" style={{ width: size * 0.48, height: size * 0.48 }} />
      </div>
    );
  }
  if (!user) return null;
  return wrap(
    <div className="rounded-full bg-primary/20 overflow-hidden flex-shrink-0 flex items-center justify-center" style={dim}>
      {user.profilePic
        ? <img src={user.profilePic} alt={user.fullName} className="w-full h-full object-cover" />
        : <span className="text-primary font-bold" style={{ fontSize: size * 0.38 }}>{user.fullName?.charAt(0).toUpperCase()}</span>
      }
    </div>
  );
};

/* ── Online dot ── */
const OnlineDot = () => (
  <span className="inline-block w-2 h-2 rounded-full bg-green-400 ring-2 ring-white flex-shrink-0" />
);

/* ── Date divider ── */
const DateDivider = ({ label }) => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px bg-border" />
    <span className="text-text-secondary font-semibold whitespace-nowrap" style={{ fontSize: 11 }}>{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

/* ── AI typing indicator ── */
const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="mb-5"><Avatar isAi size={28} /></div>
    <div className="bg-surface rounded-2xl rounded-bl-[4px] px-4 py-3 border border-border flex items-center gap-1.5 shadow-sm">
      {[0, 1, 2].map(i => (
        <span key={i} className="inline-block w-1.5 h-1.5 rounded-full bg-textSecondary/60"
          style={{ animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
      ))}
    </div>
    <style>{`@keyframes typingDot{0%,80%,100%{transform:scale(.55);opacity:.3}40%{transform:scale(1);opacity:1}}`}</style>
  </div>
);

/* ── Recording waveform ── */
const RecordingWave = () => (
  <div className="flex items-center gap-0.5" style={{ height: 20 }}>
    {[6, 12, 18, 20, 16, 10, 6].map((h, i) => (
      <span key={i} className="inline-block w-[3px] rounded-full bg-red-400"
        style={{ height: h, animation: `waveBar 0.65s ${i * 0.07}s ease-in-out infinite alternate` }} />
    ))}
    <style>{`@keyframes waveBar{from{transform:scaleY(.35)}to{transform:scaleY(1)}}`}</style>
  </div>
);

/* ── Empty state ── */
const EmptyState = ({ selectedUser }) => (
  <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-text-secondary">
    {selectedUser ? (
      <>
        <Avatar user={selectedUser} size={56} />
        <p className="text-sm font-medium mt-1">Say hello to {selectedUser.fullName}! 👋</p>
      </>
    ) : (
      <>
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="text-primary w-7 h-7" style={{ animation: "aipulse 2s ease-in-out infinite" }} />
        </div>
        <p className="text-text-primary font-bold text-base">Ask Nexo AI anything</p>
        <p className="text-sm text-center max-w-[260px] leading-relaxed">
          Powered by advanced AI. Ask questions, brainstorm ideas, or just chat!
        </p>
        <style>{`@keyframes aipulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.1)}}`}</style>
      </>
    )}
  </div>
);

/* ── Single message bubble ── */
const MessageBubble = ({ msg, isMe, isAi, authUser, selectedUser, onDelete, onImageClick, onEditRequest, onAvatarClick }) => {
  const time = new Date(msg.createdAt || Date.now())
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex items-end gap-2 group ${isMe ? "justify-end" : "justify-start"}`}>

      {/* Receiver avatar — LEFT */}
      {!isMe && (
        <div className="mb-5 flex-shrink-0">
          {isAi ? <Avatar isAi size={28} /> : <Avatar user={selectedUser} size={28} onClick={onAvatarClick} />}
        </div>
      )}

      {/* Column: name + bubble */}
      <div className={`flex flex-col gap-0.5 min-w-0 ${isMe ? "items-end max-w-[72%] sm:max-w-[65%]" : "items-start max-w-[72%] sm:max-w-[65%]"}`}>

        {/* Tiny label above received bubble */}
        {!isMe && (
          <span className="text-text-secondary font-semibold pl-1 leading-none" style={{ fontSize: 11 }}>
            {isAi ? "Nexo AI" : selectedUser?.fullName?.split(" ")[0]}
          </span>
        )}

        {/* Bubble + actions row */}
        <div className={`flex items-center gap-1.5 ${isMe ? "flex-row" : "flex-row-reverse"}`}>

          {/* Actions (sender only) */}
          {isMe && !isAi && msg._id && (
            <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {msg.text && (
                <button
                  onClick={() => onEditRequest?.(msg)}
                  title="Edit message"
                  className="p-1.5 rounded-lg text-text-secondary hover:bg-background flex-shrink-0"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => onDelete(msg._id)}
                title="Delete message"
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bubble */}
          <div className={`
            relative px-3.5 py-2.5 rounded-2xl flex flex-col gap-1 break-words
            ${isMe
              ? "bg-primary text-white rounded-br-[4px] shadow-md shadow-primary/20"
              : isAi
                ? "bg-primary/10 text-text-primary rounded-bl-[4px] border border-primary/15"
                : "bg-surface text-text-primary rounded-bl-[4px] border border-border shadow-sm"
            }
          `}>

            {/* AI badge */}
            {isAi && (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="text-primary font-bold tracking-widest uppercase" style={{ fontSize: 9 }}>Nexo AI</span>
              </div>
            )}

            {/* Image attachment */}
            {msg.image && (
              <button
                type="button"
                onClick={() => onImageClick?.(msg.image)}
                className="block p-0 border-0 bg-transparent cursor-zoom-in rounded-xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                style={{ marginBottom: msg.text ? 6 : 0 }}
              >
                <img
                  src={msg.image}
                  alt="Attachment"
                  className="rounded-xl max-h-52 w-full object-cover hover:opacity-95 transition-opacity"
                />
              </button>
            )}

            {/* Audio attachment */}
            {msg.audio && (
              <audio
                src={msg.audio}
                controls
                preload="metadata"
                className="h-9 w-full min-w-[180px] max-w-[260px]"
                style={{ marginBottom: msg.text ? 6 : 0 }}
              />
            )}

            {/* Text */}
            {msg.text && (
              <p className="text-sm leading-relaxed m-0 whitespace-pre-wrap">{msg.text}</p>
            )}

            {/* Time + read receipt */}
            <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : "justify-start"} opacity-60`}
              style={{ fontSize: 10 }}>
              <span>{time}</span>
              {msg.isEdited && <span className="text-text-secondary italic">(edited)</span>}
              {isMe && <CheckCheck className="w-3 h-3" />}
            </div>
          </div>
        </div>
      </div>

      {/* Sender avatar — RIGHT */}
      {isMe && (
        <div className="mb-5 flex-shrink-0">
          <Avatar user={authUser} size={28} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const ChatWindow = ({ onBack, showBack = false }) => {
  const {
    messages, getMessages, getAiMessages, sendMessage, sendAiMessage,
    isMessagesLoading, isSendingMessage, selectedUser, subscribeToMessages,
    unsubscribeFromMessages, hasMoreMessages, loadMoreMessages,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [aiTyping, setAiTyping] = useState(false);
  const [lightboxState, setLightboxState] = useState({ src: null, images: [], index: 0 });
  const [editingMessage, setEditingMessage] = useState(null);
  const [profileUser, setProfileUser] = useState(null);


  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
      subscribeToMessages();
    } else {
      getAiMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, getAiMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, aiTyping]);

  /* image */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file);
      setImagePreview(compressed);
    } catch (err) {
      toast.error(err.message || "Could not load image");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const removeImage = () => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; };

  /* audio */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch { toast.error("Microphone access denied or not available"); }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };
  const removeAudio = () => setAudioBlob(null);

  /* lightbox */
  const openLightboxWithImages = (images, index) => {
    if (!Array.isArray(images) || images.length === 0) return;
    const safeIndex = Math.max(0, Math.min(index, images.length - 1));
    setLightboxState({ src: images[safeIndex], images, index: safeIndex });
  };
  const closeLightbox = () => setLightboxState({ src: null, images: [], index: 0 });
  const goPrev = () => {
    setLightboxState((s) => {
      const nextIndex = s.index - 1;
      if (nextIndex < 0) return s;
      return { ...s, index: nextIndex, src: s.images[nextIndex] };
    });
  };
  const goNext = () => {
    setLightboxState((s) => {
      const nextIndex = s.index + 1;
      if (nextIndex >= s.images.length) return s;
      return { ...s, index: nextIndex, src: s.images[nextIndex] };
    });
  };


  /* edit request */
  const handleEditRequest = (msg) => {
    setEditingMessage(msg);
    setText(msg.text || "");
    inputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setText("");
  };

  /* send */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview && !audioBlob) return;
    if (isSendingMessage) return;

    if (editingMessage) {
      if (!text.trim()) {
        toast.error("Message cannot be empty");
        return;
      }
      try {
        await useChatStore.getState().editMessage({
          messageId: editingMessage._id,
          newText: text.trim(),
        });
        setEditingMessage(null);
        setText("");
        inputRef.current?.focus();
      } catch (error) {
        console.error("Failed to edit message:", error);
      }
      return;
    }

    try {
      let audioBase64 = null;
      if (audioBlob) {
        audioBase64 = await blobToUploadDataURL(audioBlob);
      }

      if (selectedUser) {
        await sendMessage({
          text: text.trim() || undefined,
          image: imagePreview || undefined,
          audio: audioBase64 || undefined,
        });
      } else {
        setAiTyping(true);
        await sendAiMessage({
          text: text.trim() || undefined,
          image: imagePreview || undefined,
          audio: audioBase64 || undefined,
        });
        setAiTyping(false);
      }

      setText("");
      setImagePreview(null);
      setAudioBlob(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      inputRef.current?.focus();
    } catch (error) {
      setAiTyping(false);
      console.error("Failed to send message:", error);
    }
  };

  const canSend =
    (editingMessage ? !!text.trim() : !!(text.trim() || imagePreview || audioBlob)) &&
    !isRecording &&
    !isSendingMessage;

  /* group by date */
  const getMessageImages = () => messages.map((m) => m.image).filter(Boolean);

  const renderMessages = () => {
    const result = [];
    let lastDate = "";

    messages.forEach((msg, idx) => {
      const d = new Date(msg.createdAt || Date.now());
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
      let label = d.toDateString() === today.toDateString() ? "Today"
        : d.toDateString() === yesterday.toDateString() ? "Yesterday"
        : d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

      if (label !== lastDate) {
        result.push(<DateDivider key={`d-${idx}`} label={label} />);
        lastDate = label;
      }
      result.push(
        <MessageBubble
          key={msg._id || idx}
          msg={msg}
          isMe={msg.senderId === authUser._id && !msg.isAiResponse}
          isAi={msg.isAiResponse}
          authUser={authUser}
          selectedUser={selectedUser}
          onDelete={(id) => useChatStore.getState().deleteMessage(id)}
          onImageClick={(src) => openLightboxWithImages(getMessageImages(), getMessageImages().indexOf(src))}
          onEditRequest={handleEditRequest}
          onAvatarClick={() => setProfileUser(selectedUser)}
        />
      );
    });
    return result;
  };

  return (
    <div className="flex-1 bg-background flex flex-col relative min-w-0 min-h-0 h-full">

      <style>{`
        @keyframes recPulse{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes micPulse{0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)}50%{box-shadow:0 0 0 5px rgba(239,68,68,0)}}
      `}</style>

      <header className="h-12 sm:h-14 bg-surface px-2 sm:px-4 flex items-center justify-between border-b border-border gap-2 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="nexo-icon-btn shrink-0"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {selectedUser ? (
            <>
              <div className="relative flex-shrink-0">
                <Avatar user={selectedUser} size={36} onClick={() => setProfileUser(selectedUser)} />
                <span className="absolute -bottom-0.5 -right-0.5"><OnlineDot /></span>
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-text-primary text-sm sm:text-base truncate leading-tight">
                  {selectedUser.fullName}
                </h2>
                <p className={`text-xs font-medium hidden sm:block leading-tight ${onlineUsers.includes(selectedUser._id) ? "text-success" : "text-text-secondary"}`}>{onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}</p>
              </div>
            </>
          ) : (
            <>
              <Avatar isAi size={36} />
              <div className="min-w-0">
                <h2 className="font-bold text-text-primary text-sm sm:text-base leading-tight">Nexo AI</h2>
                <p className="text-xs text-text-secondary hidden sm:block truncate leading-tight">
                  Chat with smartest AI – Experience the power of AI with us
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {!selectedUser && (
            <button type="button" className="bg-text-primary text-white px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-transform hover:scale-105 active:scale-95">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}
          <button type="button" className="nexo-icon-btn">
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button type="button" className="nexo-icon-btn">
            <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 flex flex-col gap-2 nexo-scrollbar min-h-0">
        {isMessagesLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
            <span className="text-sm text-text-secondary">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <EmptyState selectedUser={selectedUser} />
        ) : (
          <>
            {hasMoreMessages && (
              <div className="flex justify-center py-2">
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  className="text-xs text-text-secondary hover:text-primary font-medium px-4 py-1.5 rounded-full bg-surface border border-border transition-colors"
                >
                  Load earlier messages
                </button>
              </div>
            )}
            {renderMessages()}
          </>
        )}

        {aiTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ─── Preview bar ─── */}
      {(imagePreview || audioBlob || isRecording) && (
        <div className="bg-surface px-3 sm:px-4 py-3 mx-2 sm:mx-4 mb-2 rounded-2xl shadow-sm border border-border flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-bottom-2">

          {imagePreview && (
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => {
                  const imgs = getMessageImages();
                  openLightboxWithImages(imgs, imgs.indexOf(imagePreview));
                }}
                className="block rounded-xl overflow-hidden border border-border cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-14 h-14 object-cover block hover:opacity-90 transition-opacity"
                />
              </button>
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors border-2 border-white"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )}

          {isRecording && (
            <div className="flex items-center gap-3 flex-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"
                style={{ animation: "recPulse 1s ease-in-out infinite" }} />
              <RecordingWave />
              <span className="text-red-500 text-sm font-semibold">Recording Audio...</span>
              <button onClick={stopRecording}
                className="ml-auto flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-500 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                <Square className="w-3 h-3" /> Stop
              </button>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="flex items-center gap-3 bg-primary/5 rounded-xl px-3 py-2 flex-1">
              <Mic className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <audio src={URL.createObjectURL(audioBlob)} controls
                className="h-8 flex-1 max-w-[180px] sm:max-w-[220px]" />
              <button onClick={removeAudio}
                className="text-red-400 hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Editing indicator ─── */}
      {editingMessage && (
        <div className="mx-2 sm:mx-4 mb-1 flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border border-primary/20">
          <Pencil className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs text-text-primary font-medium flex-1 truncate">
            Editing message
          </span>
          <button
            type="button"
            onClick={cancelEditing}
            className="text-text-secondary hover:text-text-primary transition-colors shrink-0"
            title="Cancel editing"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ─── Input form ─── */}
      <form
        onSubmit={handleSendMessage}
        className="p-2 sm:p-3 bg-surface mx-2 sm:mx-4 mb-2 sm:mb-4 mt-0 rounded-2xl flex items-center gap-2 shadow-sm border border-border"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* Image button */}
        {!editingMessage && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              imagePreview
                ? "bg-primary/20 text-primary"
                : "text-text-secondary hover:text-text-primary bg-background hover:bg-background"
            }`}
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Mic button */}
        {!editingMessage && (
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              isRecording || audioBlob
                ? "bg-red-100 text-red-500"
                : "text-text-secondary hover:text-text-primary bg-background hover:bg-background"
            }`}
            style={{ animation: isRecording ? "micPulse 1s ease-in-out infinite" : "none" }}
          >
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* Text */}
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
          }}
          placeholder={editingMessage ? "Edit message..." : selectedUser ? `Message ${selectedUser.fullName}...` : "Let's ask Nexo AI..."}
          className="flex-1 bg-transparent outline-none text-text-primary placeholder-textSecondary text-sm px-1 min-w-0"
          disabled={isRecording}
        />

        {/* Send */}
        <button
          type="submit"
          disabled={!canSend || isRecording}
          className="w-9 h-9 sm:w-10 sm:h-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-95 active:scale-95 hover:scale-105 flex-shrink-0"
          aria-label="Send message"
        >
          {isSendingMessage ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      <ImageLightbox
        src={lightboxState.src}
        alt="Chat image"
        onClose={closeLightbox}
        showPrev={lightboxState.index > 0}
        showNext={lightboxState.index < lightboxState.images.length - 1}
        onPrev={goPrev}
        onNext={goNext}
        onDownload={() => {
          if (!lightboxState.src) return;
          const a = document.createElement("a");
          a.href = lightboxState.src;
          a.download = "image";
          document.body.appendChild(a);
          a.click();
          a.remove();
        }}
      />

      {profileUser && (
        <UserProfileModal user={profileUser} onClose={() => setProfileUser(null)} />
      )}
    </div>
  );
};

export default ChatWindow;