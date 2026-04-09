"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { login } from "@/lib/api";
import Link from "next/link";

export default function LoginPage() {
  const { setToken, setMode } = useStore();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      setToken(data.access_token);
      setMode(data.assistant_mode as "jarvis" | "friday");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
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
            <h1 className="text-2xl font-mono font-bold text-white tracking-widest">PERSONAL AI</h1>
            <p className="text-blue-400/60 font-mono text-xs mt-1 tracking-widest">AUTHENTICATION REQUIRED</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-blue-400/60 mb-1 tracking-widest uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-gray-800/80 border border-blue-500/30 text-white placeholder-blue-300/20 font-mono text-sm px-4 py-3 rounded-lg outline-none focus:border-blue-400 transition-colors"
                placeholder="ENTER USERNAME"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-blue-400/60 mb-1 tracking-widest uppercase">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800/80 border border-blue-500/30 text-white placeholder-blue-300/20 font-mono text-sm px-4 py-3 rounded-lg outline-none focus:border-blue-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-mono text-center">{error}</p>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-sm rounded-lg transition-colors disabled:opacity-50 tracking-widest"
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </motion.button>
          </form>

          <p className="text-center text-xs font-mono text-blue-400/40 mt-6">
            No account?{" "}
            <Link href="/register" className="text-blue-400/70 hover:text-blue-400 underline">
              REGISTER
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
