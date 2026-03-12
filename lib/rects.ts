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
export function makeSelected(rect: Rect, mx : number, my: number): Rect {
    return {
        ...rect,
        vx: 0,
        vy: 0,
        stateTime: 0,
        scale: 1.18,
        state: {
            kind: "selected",
            startX: rect.x,
            startY: rect.y,
            targetX: mx - rect.w / 2,
            targetY: my - rect.h / 2,
            duration: 0.45,
        },
    }
}
export function makeKicked(rect: Rect, px: number, py: number, kickSpeed: number): Rect {
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