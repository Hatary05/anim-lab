type RectState = (
    | { kind: "roaming" }
    | { 
        kind: "selected";
        startX: number;
        startY: number;
        targetX: number;
        targetY: number;
        duration: number;
      }
    | { kind: "kicked"; kickVx: number, kickVy: number }
);

export type Rect = {
    id: number;

    x: number;
    y: number;
    w: number;
    h: number;

    vx: number;
    vy: number;
    baseVx : number;
    baseVy : number;
    
    state: RectState;
    stateTime: number;
    scale: number;
};

function random(min: number, max: number) {
    return Math.random() * (max - min) + min;
};
export function randomVelocity() {
    return random(-120, 120);
}
function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(v, hi));
}

export function createRects(count: number, boxWidth: number, boxHeight: number): Rect[] {
    return Array.from({ length: count}, (_, i) => {
        const w = 80;
        const h = 80;
        const baseVx = randomVelocity();
        const baseVy = randomVelocity();

        return {
            id: i + 1,
            x: random(0, Math.max(0, boxWidth-w)),
            y: random(0, Math.max(0, boxHeight-h)),
            w,
            h,
            vx: baseVx,
            vy: baseVy,
            baseVx,
            baseVy,
            state: {kind : "roaming",},
            stateTime: 0,
            scale: 1
        };
    });
}

export function makeRoaming(rect: Rect): Rect {
    return {
        ...rect,
        vx: rect.baseVx,
        vy: rect.baseVy,
        state: {
            kind: "roaming",
        },
        stateTime: 0,
        scale: 1,
    }
}
export const SELECTED_SCALE = 1.88;
export function makeSelected<T extends Rect>(
  rect: T,
  targetX: number,
  targetY: number,
  scale: number = SELECTED_SCALE,
): T {
  return {
    ...rect,
    vx: 0,
    vy: 0,
    stateTime: 0,
    scale,
    state: {
      kind: "selected",
      startX: rect.x,
      startY: rect.y,
      targetX,
      targetY,
      duration: 0.45,
    },
  };
}
export function makeKicked<T extends Rect>(rect: T, px: number, py: number, kickSpeed: number): T {
    const cx = rect.x + rect.w /2 ;
    const cy = rect.y + rect.h / 2;

    let dx = cx - px;
    let dy = cy - py;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len, dy /= len;

    return {
        ...rect,
        vx: 0,
        vy: 0,
        stateTime: 0,
        scale: 1,
        state: {
            kind: "kicked",
            kickVx: dx * kickSpeed,
            kickVy: dy * kickSpeed,
        },
    };
}