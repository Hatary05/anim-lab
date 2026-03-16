import type { Rect } from "./rects";

export type Chip = Rect & {
  kind: "chip";
  title: string;
  image: string;
  href?: string;
  shellColor?: string;
  code?: string;
};

type ChipSeed = {
  title: string;
  image: string;
  href?: string;
  shellColor?: string;
  code?: string;
};

const chipSeeds: ChipSeed[] = [
  {
    title: "Anim Lab",
    image: "/chips/pikachu.png",
    href: "https://github.com/Hatary05/anim-lab",
    shellColor: "#d6d6d6",
    code: "LNA-CTR-ALB-KOR",
  },
  {
    title: "University",
    image: "/chips/university.png",
    href: "/",
    shellColor: "#d9d9d9",
    code: "LNA-CTR-UNI-KOR",
  },
  {
    title: "ME",
    image: "/chips/me.png",
    href: "/",
    shellColor: "#d9d9d9",
    code: "LNA-CTR-ME-KOR",
  },
  {
    title: "Trip",
    image: "/chips/trip.png",
    href: "/",
    shellColor: "#d3d3d3",
    code: "LNA-CTR-GEO-KOR",
  },
  {
    title: "PS-Study",
    image: "/chips/ps-study.png",
    href: "/",
    shellColor: "#d0d0d0",
    code: "LNA-CTR-PSN-KOR",
  },
  {
    title: "ICPC",
    image: "/chips/2026icpc-apac.png",
    href: "/",
    shellColor: "#d0d0d0",
    code: "LNA-CTR-ICP-KOR",
  },
];

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomVelocity() {
  return random(-120, 120);
}

export function createChips(
  count: number,
  boxWidth: number,
  boxHeight: number
): Chip[] {
  return Array.from({ length: count }, (_, i) => {
    const seed = chipSeeds[i % chipSeeds.length];

    const w = 104;
    const h = 122;

    const baseVx = randomVelocity();
    const baseVy = randomVelocity();

    return {
      id: i + 1,
      x: random(0, Math.max(0, boxWidth - w)),
      y: random(0, Math.max(0, boxHeight - h)),
      w,
      h,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      state: { kind: "roaming" },
      stateTime: 0,
      scale: 1,

      kind: "chip",
      title: seed.title,
      image: seed.image,
      href: seed.href,
      shellColor: seed.shellColor,
      code: seed.code,
    };
  });
}