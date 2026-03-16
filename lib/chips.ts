import type { Rect } from "./rects";

export type Chip = Rect & {
  kind: "chip";
  title: string;
  image: string;
  href?: string;
  shellColor?: string;
  activeShellColor?: string;
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
    shellColor: "#7887f7ff",
    code: "LNA-CTR-ALB-KOR",
  },
  {
    title: "University",
    image: "/chips/university.png",
    href: "/",
    shellColor: "#f4a25cff",
    code: "LNA-CTR-UNI-KOR",
  },
  {
    title: "ME",
    image: "/chips/me.png",
    href: "/",
    shellColor: "#effb64ff",
    code: "LNA-CTR-ME-KOR",
  },
  {
    title: "Trip",
    image: "/chips/trip.png",
    href: "/",
    shellColor: "#f48be2ff",
    code: "LNA-CTR-GEO-KOR",
  },
  {
    title: "PS-Study",
    image: "/chips/ps-study.png",
    href: "/",
    shellColor: "#25aa5aff",
    code: "LNA-CTR-PSN-KOR",
  },
  {
    title: "ICPC",
    image: "/chips/2026icpc-apac.png",
    href: "/",
    shellColor: "#5be3daff",
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
  boxWidth: number,
  boxHeight: number
): Chip[] {
  return chipSeeds.map((seed, i) => {
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
      shellColor: "#d8d8d8",
      activeShellColor: seed.shellColor,
      code: seed.code,
    };
  });
}