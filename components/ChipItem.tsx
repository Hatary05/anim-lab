import type { Chip } from "@/lib/chips";

type ChipItemProps = {
  chip: Chip;
};

export default function ChipItem({ chip }: ChipItemProps) {
  const selected = chip.state.kind === "selected";

  const shell = chip.shellColor ?? "#d8d8d8";
  const shellInner = "#e4dddd";
  const border = "#9a9a9a";

  return (
    <div
      className="absolute select-none"
      style={{
        left: chip.x,
        top: chip.y,
        width: chip.w,
        height: chip.h,
        transform: `scale(${chip.scale})`,
        transformOrigin: "top left",
        transition: "transform 120ms ease",
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          overflow: "visible",
          filter: selected
            ? "drop-shadow(0 10px 18px rgba(0,0,0,0.22))"
            : "drop-shadow(0 6px 10px rgba(0,0,0,0.14))",
        }}
      >
        {/* 외곽 / 내부 모양을 한 번에 그림 */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* OUTER */}
          <path
            d="
              M 0 0
              H 92
              H 100
              V 24
              H 92
              V 100
              H 0
              Z
            "
            fill={shell}
            stroke={border}
            strokeWidth="1.0"
            vectorEffect="non-scaling-stroke"
          />

          {/* INNER */}
          <path
            d="
              M 3 3
              H 89
              H 97
              V 21
              H 89
              V 97
              H 3
              Z
            "
            fill={shellInner}
          />
        </svg>

        {/* 제목 */}
        <div
          className="absolute font-extrabold tracking-tight text-zinc-700"
          style={{
            left: "9%",
            top: "7%",
            fontSize: "10px",
            lineHeight: 1,
            maxWidth: "72%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {chip.title}
        </div>

        {/* 썸네일 */}
        <div
          className="absolute overflow-hidden bg-white"
          style={{
            left: "8%",
            top: "20%",
            width: "72%",
            height: "70%",
            border: "1px solid #bdbdbd",
            borderRadius: "4px",
          }}
        >
          <img
            src={chip.image}
            alt={chip.title}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}