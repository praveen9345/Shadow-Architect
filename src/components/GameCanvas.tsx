import React, { useEffect, useRef, useState } from "react";
import { GameObject, isPointInShape } from "../game/math";
import { drawShape, calculateIoU } from "../game/engine";
import { LevelData } from "../game/levels";
import { ArrowLeft, RotateCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GameCanvasProps {
  level: LevelData;
  onBack: () => void;
  onWin: () => void;
}

export default function GameCanvas({ level, onBack, onWin }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [light, setLight] = useState(level.light);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [iou, setIou] = useState(0);
  const [won, setWon] = useState(false);

  // Offscreen canvases for IoU
  const targetCanvasRef = useRef<HTMLCanvasElement>(null);
  const shadowCanvasRef = useRef<HTMLCanvasElement>(null);

  const dragRef = useRef<{
    id: string | "light";
    offsetX: number;
    offsetY: number;
  } | null>(null);

  useEffect(() => {
    // Deep copy objects
    setObjects(level.objects.map((o) => ({ ...o })));
    setLight({ ...level.light });
    setWon(false);
    setIou(0);
    setSelectedId(null);
  }, [level]);

  useEffect(() => {
    if (won) return;

    const canvas = canvasRef.current;
    const targetCanvas = targetCanvasRef.current;
    const shadowCanvas = shadowCanvasRef.current;
    if (!canvas || !targetCanvas || !shadowCanvas) return;

    const ctx = canvas.getContext("2d");
    const targetCtx = targetCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    const shadowCtx = shadowCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (!ctx || !targetCtx || !shadowCtx) return;

    let animationFrameId: number;
    let frameCount = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear main canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Render target silhouette to targetCanvas (only once ideally, but doing it here for simplicity)
      if (frameCount === 0) {
        targetCtx.clearRect(0, 0, width, height);
        targetCtx.fillStyle = "black";
        for (const ts of level.targetShapes) {
          targetCtx.save();
          targetCtx.translate(ts.x, ts.y);
          targetCtx.rotate(ts.rotation);
          targetCtx.scale(ts.scale, ts.scale);
          drawShape(targetCtx, ts.type);
          targetCtx.restore();
        }
      }

      // Draw target silhouette on main canvas (faint)
      ctx.fillStyle = "rgba(99, 102, 241, 0.15)"; // Indigo faint
      ctx.strokeStyle = "rgba(99, 102, 241, 0.5)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      for (const ts of level.targetShapes) {
        ctx.save();
        ctx.translate(ts.x, ts.y);
        ctx.rotate(ts.rotation);
        ctx.scale(ts.scale, ts.scale);
        drawShape(ctx, ts.type);
        ctx.stroke();
        ctx.restore();
      }
      ctx.setLineDash([]);

      // Render shadows to shadowCanvas
      shadowCtx.clearRect(0, 0, width, height);
      shadowCtx.fillStyle = "black";
      for (const obj of objects) {
        const S = light.z / (light.z - 50);
        const sx = light.x + (obj.x - light.x) * S;
        const sy = light.y + (obj.y - light.y) * S;

        shadowCtx.save();
        shadowCtx.translate(sx, sy);
        shadowCtx.rotate(obj.rotation);
        shadowCtx.scale(obj.scale * S, obj.scale * S);
        drawShape(shadowCtx, obj.type);
        shadowCtx.restore();
      }

      // Draw shadowCanvas to main canvas
      ctx.globalAlpha = 0.4;
      ctx.drawImage(shadowCanvas, 0, 0);
      ctx.globalAlpha = 1.0;

      // Draw connection lines from light to objects
      ctx.strokeStyle = "rgba(252, 211, 77, 0.5)"; // Amber
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      for (const obj of objects) {
        ctx.beginPath();
        ctx.moveTo(light.x, light.y);
        ctx.lineTo(obj.x, obj.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw Light Source
      ctx.fillStyle = "#fbbf24"; // Amber 400
      ctx.beginPath();
      ctx.arc(light.x, light.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffbeb";
      ctx.beginPath();
      ctx.arc(light.x, light.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw Objects
      for (const obj of objects) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);
        ctx.scale(obj.scale, obj.scale);

        // Shadow for the object itself
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = selectedId === obj.id ? "#60a5fa" : "#94a3b8"; // Blue if selected, slate otherwise
        drawShape(ctx, obj.type);

        // Highlight border if selected
        if (selectedId === obj.id) {
          ctx.strokeStyle = "#2563eb";
          ctx.lineWidth = 3;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Calculate IoU every 5 frames
      if (frameCount % 5 === 0) {
        const currentIou = calculateIoU(targetCtx, shadowCtx, width, height);
        setIou(currentIou);
        if (currentIou >= 0.9 && !won) {
          setWon(true);
          setTimeout(onWin, 1500);
        }
      }

      frameCount++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [objects, light, selectedId, level, won, onWin]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (won) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    // Check light first
    if (!light.locked) {
      const dx = x - light.x;
      const dy = y - light.y;
      if (dx * dx + dy * dy <= 400) {
        // radius 20
        dragRef.current = { id: "light", offsetX: dx, offsetY: dy };
        setSelectedId(null);
        return;
      }
    }

    // Check objects (reverse order for z-index)
    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if (isPointInShape(x, y, obj)) {
        dragRef.current = {
          id: obj.id,
          offsetX: x - obj.x,
          offsetY: y - obj.y,
        };
        setSelectedId(obj.id);
        return;
      }
    }

    setSelectedId(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || won) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (dragRef.current.id === "light") {
      const offsetX = dragRef.current.offsetX;
      const offsetY = dragRef.current.offsetY;
      setLight((prev) => ({
        ...prev,
        x: x - offsetX,
        y: y - offsetY,
      }));
    } else {
      const id = dragRef.current.id;
      const offsetX = dragRef.current.offsetX;
      const offsetY = dragRef.current.offsetY;
      setObjects((prev) =>
        prev.map((obj) =>
          obj.id === id
            ? {
                ...obj,
                x: x - offsetX,
                y: y - offsetY,
              }
            : obj,
        ),
      );
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="relative w-full h-full bg-[#F6F7FB] overflow-hidden flex flex-col items-center">
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-10 pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto p-2 bg-white rounded-full shadow-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-xl font-semibold text-slate-800 tracking-tight">
          {level.name}
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
          <div className="text-sm font-medium text-slate-500">Match</div>
          <div
            className={`text-lg font-bold ${iou >= 0.9 ? "text-emerald-500" : "text-slate-800"}`}
          >
            {Math.round(iou * 100)}%
          </div>
        </div>
      </div>

      {/* Canvas Container */}
      <div className="flex-1 w-full max-w-4xl flex items-center justify-center p-4 mt-16">
        <div className="relative w-full aspect-[4/3] bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {/* Hidden canvases for IoU */}
          <canvas
            ref={targetCanvasRef}
            width={800}
            height={600}
            className="hidden"
          />
          <canvas
            ref={shadowCanvasRef}
            width={800}
            height={600}
            className="hidden"
          />

          {/* Win Overlay */}
          <AnimatePresence>
            {won && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
              >
                <CheckCircle2 size={80} className="text-emerald-500 mb-4" />
                <h2 className="text-3xl font-bold text-slate-800">
                  Perfect Match!
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-24 w-full max-w-4xl px-4 pb-6 flex items-center justify-center gap-6">
        {selectedId && (
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-md border border-slate-100 w-full max-w-md">
            <RotateCw size={20} className="text-slate-400" />
            <input
              type="range"
              min="0"
              max={Math.PI * 2}
              step="0.05"
              value={objects.find((o) => o.id === selectedId)?.rotation || 0}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setObjects((prev) =>
                  prev.map((o) =>
                    o.id === selectedId ? { ...o, rotation: val } : o,
                  ),
                );
              }}
              className="flex-1 accent-indigo-500"
            />
          </div>
        )}

        {!light.locked && (
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl shadow-md border border-slate-100 w-full max-w-md">
            <div className="text-sm font-medium text-slate-500">
              Light Height
            </div>
            <input
              type="range"
              min="60"
              max="300"
              step="1"
              value={light.z}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setLight((prev) => ({ ...prev, z: val }));
              }}
              className="flex-1 accent-amber-500"
            />
          </div>
        )}
      </div>
    </div>
  );
}
