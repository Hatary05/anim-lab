import {
  type Rect,
  randomVelocity,
  makeKicked,
  makeRoaming,
  makeSelected,
} from "./rects";
import { SELECTED_SCALE } from "./rects";

export type BoxSize = {
  width: number;
  height: number;
};
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(v, hi));
}

function getVisualSize(rect: Rect, scale = rect.scale) {
  return {
    width: rect.w * scale,
    height: rect.h * scale,
  };
}

function getSelectedTarget(
  rect: Rect,
  mx: number,
  my: number,
  box: BoxSize,
  nextScale: number
) {
  const visual = getVisualSize(rect, nextScale);

  const rawX = mx - visual.width / 2;
  const rawY = my - visual.height / 2;

  return {
    x: clamp(rawX, 0, Math.max(0, box.width - visual.width)),
    y: clamp(rawY, 0, Math.max(0, box.height - visual.height)),
  };
}

export function reflectRect<T extends Rect>(rect: T, box: BoxSize): T {
  let nx = rect.x;
  let ny = rect.y;
  let nvx = rect.vx;
  let nvy = rect.vy;

  const visual = getVisualSize(rect);

  if (nx <= 0) {
    nx = 0;
    nvx *= -1;
  } else if (nx + visual.width >= box.width) {
    nx = box.width - visual.width;
    nvx *= -1;
  }

  if (ny <= 0) {
    ny = 0;
    nvy *= -1;
  } else if (ny + visual.height >= box.height) {
    ny = box.height - visual.height;
    nvy *= -1;
  }

  return {
    ...rect,
    x: nx,
    y: ny,
    vx: nvx,
    vy: nvy,
  };
}
export function moveRect<T extends Rect>(rect: T, dt: number): T {
  return {
    ...rect,
    x: rect.x + rect.vx * dt,
    y: rect.y + rect.vy * dt,
  };
}

const KICK_SPEED = 260;
const SLOW_DOWN_TIME = 0.8;
const PAUSE_TIME = 0.05;
const RECOVER_TIME = 0.8;

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function updateRoamingRect<T extends Rect>(rect: T, dt: number, box: BoxSize): T {
  const moved = moveRect(rect, dt);
  const reflected = reflectRect(moved, box);

  return {
    ...reflected,
    stateTime: rect.stateTime + dt,
    scale: 1,
    baseVx: reflected.vx,
    baseVy: reflected.vy,
  };
}
function updateSelectedRect<T extends Rect>(rect: T, dt: number): T {
  if (rect.state.kind !== "selected") return rect;

  const nextTime = rect.stateTime + dt;
  const u = clamp01(nextTime / rect.state.duration);

  const progress = (1 - Math.cos(Math.PI * u)) / 2;

  const nx = lerp(rect.state.startX, rect.state.targetX, progress);
  const ny = lerp(rect.state.startY, rect.state.targetY, progress);

  const dx = rect.state.targetX - rect.state.startX;
  const dy = rect.state.targetY - rect.state.startY;
  const duration = rect.state.duration;

  const speedScale = (Math.PI / (2 * duration)) * Math.sin(Math.PI * u);

  return {
    ...rect,
    x: nx,
    y: ny,
    vx: dx * speedScale,
    vy: dy * speedScale,
    stateTime: nextTime,
  };
}
function updateKickedRect<T extends Rect>(rect: T, dt: number, box: BoxSize): T {
  if (rect.state.kind !== "kicked") return rect;

  const nextTime = rect.stateTime + dt;

  let vx = 0;
  let vy = 0;
  let nextKind: "roaming" | "kicked" = "kicked";

  if (nextTime < SLOW_DOWN_TIME) {
    const t = clamp01(nextTime / SLOW_DOWN_TIME);
    const factor = 1 - t;
    vx = rect.state.kickVx * factor;
    vy = rect.state.kickVy * factor;
  } else if (nextTime < SLOW_DOWN_TIME + PAUSE_TIME) {
    vx = 0;
    vy = 0;
  } else if (nextTime < SLOW_DOWN_TIME + PAUSE_TIME + RECOVER_TIME) {
    const t = (nextTime - SLOW_DOWN_TIME - PAUSE_TIME) / RECOVER_TIME;
    const a = clamp01(t);
    vx = lerp(0, rect.baseVx, a);
    vy = lerp(0, rect.baseVy, a);
  } else {
    nextKind = "roaming";
    vx = rect.baseVx;
    vy = rect.baseVy;
  }

  const moved = moveRect({ ...rect, vx, vy }, dt);
  const reflected = reflectRect(moved, box);

  if (nextKind === "roaming") {
    return {
      ...reflected,
      state: { kind: "roaming" },
      stateTime: 0,
      scale: 1,
      baseVx: reflected.vx,
      baseVy: reflected.vy,
    };
  }

  return {
    ...reflected,
    state: {
      kind: "kicked",
      kickVx: rect.state.kickVx,
      kickVy: rect.state.kickVy,
    },
    stateTime: nextTime,
    scale: 1,
  };
}
export function updateRect<T extends Rect>(rect: T, dt: number, box: BoxSize): T {
  switch (rect.state.kind) {
    case "roaming":
      return updateRoamingRect(rect, dt, box);
    case "selected":
      return updateSelectedRect(rect, dt);
    case "kicked":
      return updateKickedRect(rect, dt, box);
  }
}

export function findClosestRectId<T extends Rect>(
  rects: T[],
  mx: number,
  my: number
): number | null {
  if (rects.length === 0) return null;

  let bestId = rects[0].id;
  let bestDist = Infinity;

  for (const rect of rects) {
    const cx = rect.x + rect.w / 2;
    const cy = rect.y + rect.h / 2;
    const dx = cx - mx;
    const dy = cy - my;
    const dist2 = dx * dx + dy * dy;

    if (dist2 < bestDist) {
      bestDist = dist2;
      bestId = rect.id;
    }
  }

  return bestId;
}

export function moveRectToPoint<T extends Rect>(rect: T, mx: number, my: number): T {
  return {
    ...rect,
    x: mx - rect.w / 2,
    y: my - rect.h / 2,
  };
}

export function selectClosestRect<T extends Rect>(
  rects: T[],
  mx: number,
  my: number,
  box: BoxSize
): T[] {
  const id = findClosestRectId(rects, mx, my);
  if (id == null) return rects;

  return rects.map((rect) => {
    if (rect.id === id) {
      const target = getSelectedTarget(rect, mx, my, box, SELECTED_SCALE);
      return makeSelected(rect, target.x, target.y, SELECTED_SCALE);
    }

    if (rect.state.kind === "selected") {
      return makeKicked(
        { ...rect, baseVx: randomVelocity(), baseVy: randomVelocity(), scale: 1 },
        mx,
        my,
        KICK_SPEED
      );
    }

    return makeKicked(rect, mx, my, KICK_SPEED);
  });
}
export function updateRects<T extends Rect>(rects: T[], dt: number, box: BoxSize): T[] {
  return rects.map((rect) => updateRect(rect, dt, box));
}