import type { Chip } from "@/lib/chips";

type ChipItemProps = {
  chip: Chip;
};

export default function ChipItem({ chip }: ChipItemProps) {
  const selected = chip.state.kind === "selected";

  const shell = (selected ? chip.activeShellColor : chip.shellColor);
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
        transformOrigin: "center center",
        transition: "transform 120ms ease",
      }}
    >
      <div
        className="relative h-full w-full"
        style={{
          overflow: "visible",
        }}
      >
        <svg
  className="absolute inset-0 h-full w-full"
  viewBox="0 0 100 100"
  preserveAspectRatio="none"
  aria-hidden="true"
>
      {/* OUTER */}
      <path
        d="
          M 4 0
          H 96
          Q 100 0 100 4
          V 20
          Q 100 24 96 24
          H 95
          Q 92 24 92 27
          V 96
          Q 92 100 88 100
          H 4
          Q 0 100 0 96
          V 4
          Q 0 0 4 0
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
          M 6 3
          H 93
          Q 97 3 97 7
          V 17
          Q 97 21 93 21
          H 92
          Q 89 21 89 24
          V 94
          Q 89 97 86 97
          H 6
          Q 3 97 3 94
          V 6
          Q 3 3 6 3
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