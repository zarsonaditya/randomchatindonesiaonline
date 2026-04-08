import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, User, Calendar, Users } from "lucide-react";

interface UserProfile {
  username: string;
  age: number;
  gender: string;
}

interface LoginPageProps {
  onJoin: (profile: UserProfile) => void;
}

export default function LoginPage({ onJoin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = "Nama pengguna wajib diisi";
    else if (username.trim().length < 2) newErrors.username = "Minimal 2 karakter";
    else if (username.trim().length > 30) newErrors.username = "Maksimal 30 karakter";
    if (!age) newErrors.age = "Umur wajib diisi";
    else if (parseInt(age) < 13) newErrors.age = "Minimal umur 13 tahun";
    else if (parseInt(age) > 99) newErrors.age = "Umur tidak valid";
    if (!gender) newErrors.gender = "Jenis kelamin wajib dipilih";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onJoin({ username: username.trim(), age: parseInt(age), gender });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />
        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7c3aed, transparent)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 gradient-btn shadow-lg"
          >
            <MessageCircle size={36} className="text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold gradient-text mb-2"
          >
            RandomChat Indonesia
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-sm"
          >
            Temukan teman baru secara acak dan anonim
          </motion.p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <User size={14} className="text-primary" />
                  Nama Pengguna
                </span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan nama kamu..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                autoComplete="off"
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-destructive">{errors.username}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  Umur
                </span>
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Masukkan umurmu..."
                min="13"
                max="99"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
              />
              {errors.age && (
                <p className="mt-1.5 text-xs text-destructive">{errors.age}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <span className="flex items-center gap-2">
                  <Users size={14} className="text-primary" />
                  Jenis Kelamin
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "laki-laki", label: "Laki-laki" },
                  { value: "perempuan", label: "Perempuan" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setGender(option.value)}
                    className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                      gender === option.value
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.gender && (
                <p className="mt-1.5 text-xs text-destructive">{errors.gender}</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="w-full py-3.5 px-6 gradient-btn text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              Mulai Chat Sekarang
            </motion.button>
          </form>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground mt-4"
        >
          Dengan bergabung, kamu setuju untuk bersikap sopan dan hormat kepada sesama.
        </motion.p>
      </motion.div>
    </div>
  );
}
