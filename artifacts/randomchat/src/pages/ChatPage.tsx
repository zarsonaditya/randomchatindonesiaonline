import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  SkipForward,
  LogOut,
  MessageCircle,
  User,
  AlertCircle,
} from "lucide-react";
import { Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  from: "me" | "stranger";
  timestamp: string;
}

interface StrangerInfo {
  username: string;
  age: number;
  gender: string;
}

interface ChatPageProps {
  socket: Socket;
  userProfile: { username: string; age: number; gender: string };
  stranger: StrangerInfo;
  onLeave: () => void;
  onFindNew: () => void;
}

export default function ChatPage({
  socket,
  userProfile,
  stranger,
  onLeave,
  onFindNew,
}: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStrangerTyping, setIsStrangerTyping] = useState(false);
  const [strangerLeft, setStrangerLeft] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    const handleMessage = (data: { text: string; from: "stranger"; timestamp: string }) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: data.text, from: "stranger", timestamp: data.timestamp },
      ]);
    };

    const handleTyping = (isTyping: boolean) => {
      setIsStrangerTyping(isTyping);
    };

    const handleStrangerLeft = () => {
      setStrangerLeft(true);
    };

    socket.on("message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stranger_left", handleStrangerLeft);

    return () => {
      socket.off("message", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stranger_left", handleStrangerLeft);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStrangerTyping]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || strangerLeft) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, from: "me", timestamp: new Date().toISOString() },
    ]);
    socket.emit("message", { text });
    setInputText("");

    if (isTypingRef.current) {
      socket.emit("typing", false);
      isTypingRef.current = false;
    }
  }, [inputText, socket, strangerLeft]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (!isTypingRef.current) {
      socket.emit("typing", true);
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", false);
      isTypingRef.current = false;
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFindNew = () => {
    socket.emit("find_new", userProfile);
    onFindNew();
  };

  const handleLeave = () => {
    socket.emit("leave_room");
    onLeave();
  };

  const formatTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 glass-card border-b border-white/8 px-4 py-3 flex items-center gap-3">
        <div className="flex items-center justify-center gap-1 mr-1">
          <MessageCircle size={16} className="text-primary" />
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center font-bold text-white text-sm shadow-md">
              {stranger.username.charAt(0).toUpperCase()}
            </div>
            {!strangerLeft && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm leading-none mb-0.5">
              {stranger.username}
            </p>
            <p className="text-xs text-muted-foreground">
              {stranger.age} tahun &bull; {stranger.gender === "laki-laki" ? "Laki-laki" : "Perempuan"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFindNew}
            title="Cari stranger baru"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all"
          >
            <SkipForward size={13} />
            <span className="hidden sm:inline">Stranger Baru</span>
          </button>
          <button
            onClick={handleLeave}
            title="Keluar"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 relative z-10">
        {/* Welcome message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center"
        >
          <div className="glass-card rounded-full px-4 py-1.5 text-xs text-muted-foreground">
            Kamu terhubung dengan {stranger.username}. Mulai ngobrol!
          </div>
        </motion.div>

        {/* Message list */}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              {msg.from === "stranger" && (
                <div className="w-7 h-7 rounded-full gradient-btn flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
                  {stranger.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div
                className={`max-w-[75%] ${msg.from === "me" ? "message-in-right" : "message-in-left"}`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.from === "me"
                      ? "gradient-btn text-white rounded-br-sm"
                      : "glass-card text-foreground border border-white/10 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <p
                  className={`text-xs text-muted-foreground mt-1 ${
                    msg.from === "me" ? "text-right" : "text-left"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              {msg.from === "me" && (
                <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold ml-2 flex-shrink-0 self-end">
                  <User size={12} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {isStrangerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex justify-start items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full gradient-btn flex items-center justify-center text-white text-xs font-bold">
                {stranger.username.charAt(0).toUpperCase()}
              </div>
              <div className="glass-card border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stranger left notification */}
        <AnimatePresence>
          {strangerLeft && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="glass-card border border-destructive/20 rounded-xl px-5 py-3 text-center max-w-xs">
                <AlertCircle size={16} className="text-destructive mx-auto mb-1" />
                <p className="text-sm font-medium text-foreground mb-1">
                  {stranger.username} telah meninggalkan chat.
                </p>
                <p className="text-xs text-muted-foreground">
                  Cari stranger baru untuk melanjutkan obrolan.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 glass-card border-t border-white/8 px-4 py-3">
        {strangerLeft ? (
          <div className="flex gap-3">
            <button
              onClick={handleFindNew}
              className="flex-1 py-3 rounded-xl gradient-btn text-white font-medium text-sm shadow-lg transition-all hover:opacity-90"
            >
              Cari Stranger Baru
            </button>
            <button
              onClick={handleLeave}
              className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground transition-all text-sm"
            >
              Keluar
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm"
              autoComplete="off"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-xl gradient-btn text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all flex-shrink-0"
            >
              <Send size={16} />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
