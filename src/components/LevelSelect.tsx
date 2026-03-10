import React from "react";
import { LEVELS } from "../game/levels";
import { ArrowLeft, Lock, Star } from "lucide-react";
import { motion } from "motion/react";

interface LevelSelectProps {
  onBack: () => void;
  onSelectLevel: (id: number) => void;
  completedLevels: number[];
}

export default function LevelSelect({
  onBack,
  onSelectLevel,
  completedLevels,
}: LevelSelectProps) {
  const maxCompleted = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
  const totalLevels = Math.max(LEVELS.length, maxCompleted + 1);
  const levelIds = Array.from({ length: totalLevels }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#F6F7FB] p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex items-center mb-12">
        <button
          onClick={onBack}
          className="p-3 bg-white rounded-full shadow-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-slate-800 ml-6 tracking-tight">
          Select Level
        </h1>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-12">
        {levelIds.map((id) => {
          const isUnlocked = id === 1 || completedLevels.includes(id - 1);
          const isCompleted = completedLevels.includes(id);

          return (
            <motion.button
              key={id}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              whileTap={isUnlocked ? { scale: 0.95 } : {}}
              onClick={() => isUnlocked && onSelectLevel(id)}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-4 transition-shadow
                                ${
                                  isUnlocked
                                    ? "bg-white shadow-md hover:shadow-lg border border-slate-100 cursor-pointer"
                                    : "bg-slate-100 border border-slate-200 cursor-not-allowed opacity-70"
                                }`}
            >
              <span
                className={`text-3xl font-bold mb-2 ${isUnlocked ? "text-slate-800" : "text-slate-400"}`}
              >
                {id}
              </span>

              {isUnlocked ? (
                <div className="flex gap-1">
                  <Star
                    size={16}
                    className={
                      isCompleted
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }
                  />
                  <Star
                    size={16}
                    className={
                      isCompleted
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }
                  />
                  <Star
                    size={16}
                    className={
                      isCompleted
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }
                  />
                </div>
              ) : (
                <Lock size={20} className="text-slate-400" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
