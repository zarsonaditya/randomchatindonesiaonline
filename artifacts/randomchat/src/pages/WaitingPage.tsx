import { useEffect } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Users, Wifi } from "lucide-react";
import { useGetChatStats } from "@workspace/api-client-react";

interface WaitingPageProps {
  username: string;
  onCancel: () => void;
}

export default function WaitingPage({ username, onCancel }: WaitingPageProps) {
  const { data: stats, refetch } = useGetChatStats();

  useEffect(() => {
    const interval = setInterval(() => { void refetch(); }, 3000);
    return () => clearInterval(interval);
  }, [refetch]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
      </div>

      <div className="w-full max-w-sm text-center relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <MessageCircle size={20} className="text-primary" />
          <span className="text-primary font-semibold text-lg">RandomChat Indonesia</span>
        </motion.div>

        {/* Pulse Animation */}
        <div className="relative flex items-center justify-center mb-8">
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent)" }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.3), transparent)" }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative z-10 w-20 h-20 rounded-full gradient-btn flex items-center justify-center shadow-xl"
          >
            <Users size={32} className="text-white" />
          </motion.div>
        </div>

        {/* Status Text */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          Mencari Stranger...
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-sm mb-1"
        >
          Halo, <span className="text-primary font-medium">{username}</span>!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-muted-foreground text-sm mb-8"
        >
          Harap tunggu, kami sedang mencarikan stranger untukmu...
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card rounded-xl p-4 mb-6 flex justify-around"
          >
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{stats.activeUsers}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-bold text-secondary">{stats.activePairs}</p>
              <p className="text-xs text-muted-foreground">Sedang Chat</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-xl font-bold text-accent">{stats.waitingUsers}</p>
              <p className="text-xs text-muted-foreground">Menunggu</p>
            </div>
          </motion.div>
        )}

        {/* Connection indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6"
        >
          <Wifi size={12} className="text-green-500" />
          <span>Terhubung dan menunggu</span>
        </motion.div>

        {/* Cancel button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="w-full py-3 px-6 rounded-xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all text-sm font-medium"
        >
          Batalkan
        </motion.button>
      </div>
    </div>
  );
}
