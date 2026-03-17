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

function getVisualBounds(rect: Rect, scale = rect.scale) {
  const width = rect.w * scale;
  const height = rect.h * scale;

  const extraX = (width - rect.w) / 2;
  const extraY = (height - rect.h) / 2;

  return {
    x: rect.x - extraX,
    y: rect.y - extraY,
    width,
    height,
    extraX,
    extraY,
  };
}
function getSelectedTarget(
  rect: Rect,
  mx: number,
  my: number,
  box: BoxSize,
  nextScale: number
) {
  const visual = getVisualBounds(rect, nextScale);
  const rawX = mx - rect.w / 2;
  const rawY = my - rect.h / 2;

  const minX = visual.extraX;
  const maxX = Math.max(minX, box.width - rect.w - visual.extraX);

  const minY = visual.extraY;
  const maxY = Math.max(minY, box.height - rect.h - visual.extraY);

  return {
    x: clamp(rawX, minX, maxX),
    y: clamp(rawY, minY, maxY),
  };
}

export function reflectRect<T extends Rect>(
  rect: T, 
  box: BoxSize,
  restitution = 0.8,
): T {
  let nx = rect.x;
  let ny = rect.y;
  let nvx = rect.vx;
  let nvy = rect.vy;

  const visual = getVisualBounds(rect);

  if (nx <= 0) {
    nx = 0;
    nvx *= -1 * restitution ;
  } else if (nx + visual.width >= box.width) {
    nx = box.width - visual.width;
    nvx *= -1 * restitution;
  }

  if (ny <= 0) {
    ny = 0;
    nvy *= -1 * restitution;
  } else if (ny + visual.height >= box.height) {
    ny = box.height - visual.height;
    nvy *= -1 * restitution;
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

const KICK_SPEED = 280;
const SLOW_DOWN_TIME = 0.8;
const PAUSE_TIME = 0.05;
const RECOVER_TIME = 1;

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

const SELECTED_SHAKE_START = 3.0;
const SELECTED_RELEASE_TIME = 5.0;
const SELECTED_SHAKE_AMPLITUDE_START = 0.4;
const SELECTED_SHAKE_AMPLITUDE_END = 2.4;
const SELECTED_SHAKE_FREQ_START = 1.0;
const SELECTED_SHAKE_FREQ_END = 10.0;
function updateSelectedRect<T extends Rect>(rect: T, dt: number, box: BoxSize): T {
  if (rect.state.kind !== "selected") return rect;

  const nextTime = rect.stateTime + dt;

  if (nextTime >= SELECTED_RELEASE_TIME) {
    return makeRoaming({
      ...rect,
      x: rect.state.targetX,
      y: rect.state.targetY,
      scale: 1,
    }) as T;
  }

  let nx = rect.x;
  let ny = rect.y;
  let vx = 0;
  let vy = 0;

  if (nextTime <= rect.state.duration) {
    const u = clamp01(nextTime / rect.state.duration);
    const progress = (1 - Math.cos(Math.PI * u)) / 2;

    nx = lerp(rect.state.startX, rect.state.targetX, progress);
    ny = lerp(rect.state.startY, rect.state.targetY, progress);

    const dx = rect.state.targetX - rect.state.startX;
    const dy = rect.state.targetY - rect.state.startY;
    const duration = rect.state.duration;
    const speedScale = (Math.PI / (2 * duration)) * Math.sin(Math.PI * u);

    vx = dx * speedScale;
    vy = dy * speedScale;
  } else {
    nx = rect.state.targetX;
    ny = rect.state.targetY;
    vx = 0;
    vy = 0;
  }

  if (nextTime >= SELECTED_SHAKE_START) {
    const shakeTime = nextTime - SELECTED_SHAKE_START;
    const shakeWindow = SELECTED_RELEASE_TIME - SELECTED_SHAKE_START;

    const p = clamp01(shakeTime / shakeWindow);

    const amp = lerp(
      SELECTED_SHAKE_AMPLITUDE_START,
      SELECTED_SHAKE_AMPLITUDE_END,
      p * p
    );

    const f0 = SELECTED_SHAKE_FREQ_START;
    const f1 = SELECTED_SHAKE_FREQ_END;
    const k = (f1 - f0) / shakeWindow;

    const phase = 2 * Math.PI * (f0 * shakeTime + 0.5 * k * shakeTime * shakeTime);

    const offsetX = Math.sin(phase) * amp;
    const offsetY = Math.cos(phase * 1.17 + 0.7) * amp * 0.15;

    const visual = getVisualBounds(rect);

    nx = clamp(
      rect.state.targetX + offsetX,
      0,
      Math.max(0, box.width - visual.width)
    );
    ny = clamp(
      rect.state.targetY + offsetY,
      0,
      Math.max(0, box.height - visual.height)
    );

    vx = 0;
    vy = 0;
  }

  return {
    ...rect,
    x: nx,
    y: ny,
    vx,
    vy,
    stateTime: nextTime,
  };
}
function updateKickedRect<T extends Rect>(rect: T, dt: number, box: BoxSize): T {
  if (rect.state.kind !== "kicked") return rect;

  const prevTime = rect.stateTime;
  const nextTime = prevTime + dt;

  let vx = rect.vx;
  let vy = rect.vy;
  let nextKind: "roaming" | "kicked" = "kicked";

  if (nextTime < SLOW_DOWN_TIME) {
    const prevFactor = Math.max(1e-6, 1 - clamp01(prevTime / SLOW_DOWN_TIME));
    const nextFactor = 1 - clamp01(nextTime / SLOW_DOWN_TIME);
    const ratio = nextFactor / prevFactor;

    vx = rect.vx * ratio;
    vy = rect.vy * ratio;
  }
  else if (nextTime < SLOW_DOWN_TIME + PAUSE_TIME) {
    vx = 0;
    vy = 0;
  }
  else if (nextTime < SLOW_DOWN_TIME + PAUSE_TIME + RECOVER_TIME) {
    const recoverStart = SLOW_DOWN_TIME + PAUSE_TIME;

    const prevA = clamp01((prevTime - recoverStart) / RECOVER_TIME);
    const nextA = clamp01((nextTime - recoverStart) / RECOVER_TIME);

    const blend = (nextA - prevA) / Math.max(1e-6, 1 - prevA);

    vx = rect.vx + (rect.baseVx - rect.vx) * blend;
    vy = rect.vy + (rect.baseVy - rect.vy) * blend;
  }
  else {
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
      return updateSelectedRect(rect, dt, box);
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

    const [baseVx, baseVy] = randomVelocity();
    if (rect.state.kind === "selected") {
      return makeKicked(
        { ...rect, baseVx, baseVy, scale: 1 },
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