export type RectMode = "roaming" | "selected";

export type Rect = {
    id: number;
    x: number;
    y: number;
    w: number;
    h: number;
    vx: number;
    vy: number;
    mode: RectMode;
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

        return {
            id: i + 1,
            x: random(0, Math.max(0, boxWidth-w)),
            y: random(0, Math.max(0, boxHeight-h)),
            w,
            h,
            vx: randomVelocity(),
            vy: randomVelocity(),
            mode: "roaming"
        };
    });
}