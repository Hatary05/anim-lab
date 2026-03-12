import { type Rect, randomVelocity} from "./rects";

export type BoxSize = {
  width: number;
  height: number;
};

export function reflectRect(rect: Rect, box: BoxSize): Rect {
  let nx = rect.x;
  let ny = rect.y;
  let nvx = rect.vx;
  let nvy = rect.vy;

  if (nx <= 0) {
    nx = 0;
    nvx *= -1;
  } else if (nx + rect.w >= box.width) {
    nx = box.width - rect.w;
    nvx *= -1;
  }

  if (ny <= 0) {
    ny = 0;
    nvy *= -1;
  } else if (ny + rect.h >= box.height) {
    ny = box.height - rect.h;
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
export function moveRect(rect: Rect, dt: number): Rect {
  return {
    ...rect,
    x: rect.x + rect.vx * dt,
    y: rect.y + rect.vy * dt,
  };
}

export function updateRect(rect: Rect, dt: number, box: BoxSize): Rect {
  if (rect.mode === "selected") {
    return rect;
  }

  const moved = moveRect(rect, dt);
  return reflectRect(moved, box);
}

export function updateRects(rects: Rect[], dt: number, box: BoxSize): Rect[] {
  return rects.map((rect) => updateRect(rect, dt, box));
}

export function findClosestRectId(
  rects: Rect[],
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

export function moveRectToPoint(rect: Rect, mx: number, my: number): Rect {
  return {
    ...rect,
    x: mx - rect.w / 2,
    y: my - rect.h / 2,
  };
}

export function selectClosestRect(rects: Rect[], mx: number, my: number): Rect[] {
  const id = findClosestRectId(rects, mx, my);
  if (id == null) return rects;

  return rects.map((rect) => {
    if (rect.id === id) {
      return {
        ...rect,
        x: mx - rect.w / 2,
        y: my - rect.h / 2,
        vx: 0,
        vy: 0,
        mode: "selected",
      };
    }

    if(rect.mode === "selected") {
      return {
        ...rect,
        vx: randomVelocity(),
        vy: randomVelocity(),
        mode: "roaming"
      };
    }

    return rect;
  });
}