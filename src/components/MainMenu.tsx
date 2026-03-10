import React from "react";
import { Play, Grid } from "lucide-react";
import { motion } from "motion/react";

interface MainMenuProps {
  onPlay: () => void;
  onLevels: () => void;
}

export default function MainMenu({ onPlay, onLevels }: MainMenuProps) {
  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div
        className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"
        style={{ animationDelay: "4s" }}
      ></div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center mb-16"
      >
        <img src="/icon.svg" alt="Shadow Architect Icon" className="w-24 h-24 mb-6 drop-shadow-2xl" />
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tighter text-center">
          Shadow <br />
          <span className="text-indigo-600">Architect</span>
        </h1>
        <p className="mt-4 text-slate-600 font-medium text-lg">
          Shape the light.
        </p>
      </motion.div>

      <div className="z-10 flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlay}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
        >
          <Play fill="currentColor" size={20} /> Play Now
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onLevels}
          className="w-full py-4 bg-white text-slate-800 rounded-2xl font-bold text-lg shadow-md border border-slate-100 flex items-center justify-center gap-2"
        >
          <Grid size={20} /> Levels
        </motion.button>
      </div>
    </div>
  );
}
