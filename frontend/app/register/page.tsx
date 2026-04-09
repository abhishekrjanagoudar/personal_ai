"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(username, email, password);
      router.push("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="border border-blue-500/30 bg-gray-900/90 backdrop-blur-md rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-mono font-bold text-white tracking-widest">CREATE ACCOUNT</h1>
            <p className="text-blue-400/60 font-mono text-xs mt-1 tracking-widest">PERSONAL AI SYSTEM</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: "Username", val: username, set: setUsername, type: "text", ph: "CHOOSE USERNAME" },
              { label: "Email", val: email, set: setEmail, type: "email", ph: "YOUR@EMAIL.COM" },
              { label: "Password", val: password, set: setPassword, type: "password", ph: "••••••••" },
            ].map(({ label, val, set, type, ph }) => (
              <div key={label}>
                <label className="block text-xs font-mono text-blue-400/60 mb-1 tracking-widest uppercase">
                  {label}
                </label>
                <input
                  type={type}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  required
                  className="w-full bg-gray-800/80 border border-blue-500/30 text-white placeholder-blue-300/20 font-mono text-sm px-4 py-3 rounded-lg outline-none focus:border-blue-400 transition-colors"
                  placeholder={ph}
                />
              </div>
            ))}

            {error && <p className="text-red-400 text-xs font-mono text-center">{error}</p>}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-sm rounded-lg transition-colors disabled:opacity-50 tracking-widest"
            >
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </motion.button>
          </form>

          <p className="text-center text-xs font-mono text-blue-400/40 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400/70 hover:text-blue-400 underline">
              LOGIN
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
