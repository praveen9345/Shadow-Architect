import { ShapeType } from "./math";

export function drawShape(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  type: ShapeType,
) {
  ctx.beginPath();
  if (type === "square") {
    ctx.rect(-50, -50, 100, 100);
  } else if (type === "rectangle") {
    ctx.rect(-40, -80, 80, 160);
  } else if (type === "triangle") {
    ctx.moveTo(0, -50);
    ctx.lineTo(50, 50);
    ctx.lineTo(-50, 50);
    ctx.closePath();
  } else if (type === "circle") {
    ctx.arc(0, 0, 50, 0, Math.PI * 2);
  }
  ctx.fill();
}

export function calculateIoU(
  targetCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  shadowCtx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D,
  width: number,
  height: number,
): number {
  const targetData = targetCtx.getImageData(0, 0, width, height).data;
  const shadowData = shadowCtx.getImageData(0, 0, width, height).data;

  let intersection = 0;
  let union = 0;

  for (let i = 3; i < targetData.length; i += 4) {
    const t = targetData[i] > 128;
    const s = shadowData[i] > 128;

    if (t && s) intersection++;
    if (t || s) union++;
  }

  return union === 0 ? 0 : intersection / union;
}
