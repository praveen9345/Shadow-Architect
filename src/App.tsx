import React, { useState, useEffect, useMemo } from "react";
import MainMenu from "./components/MainMenu";
import LevelSelect from "./components/LevelSelect";
import GameCanvas from "./components/GameCanvas";
import { getLevel } from "./game/levels";

type Screen = "menu" | "levels" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("shadow_architect_completed");
    if (saved) {
      try {
        setCompletedLevels(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const currentLevelData = useMemo(() => getLevel(currentLevelId), [currentLevelId]);

  const handleWin = () => {
    if (!completedLevels.includes(currentLevelId)) {
      const newCompleted = [...completedLevels, currentLevelId];
      setCompletedLevels(newCompleted);
      localStorage.setItem(
        "shadow_architect_completed",
        JSON.stringify(newCompleted),
      );
    }

    // Go to next level
    setCurrentLevelId(currentLevelId + 1);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-[#F6F7FB] font-sans">
      {screen === "menu" && (
        <MainMenu
          onPlay={() => {
            const maxCompleted = completedLevels.length > 0 ? Math.max(...completedLevels) : 0;
            setCurrentLevelId(maxCompleted + 1);
            setScreen("game");
          }}
          onLevels={() => setScreen("levels")}
        />
      )}

      {screen === "levels" && (
        <LevelSelect
          completedLevels={completedLevels}
          onBack={() => setScreen("menu")}
          onSelectLevel={(id) => {
            setCurrentLevelId(id);
            setScreen("game");
          }}
        />
      )}

      {screen === "game" && (
        <GameCanvas
          level={currentLevelData}
          onBack={() => setScreen("levels")}
          onWin={handleWin}
        />
      )}
    </div>
  );
}
