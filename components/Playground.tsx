"use client";

import { useEffect, useRef, useState } from "react";
import { createRects, type Rect } from "@/lib/rects";
import { updateRects, type BoxSize, selectClosestRect } from "@/lib/physics";
import { createChips, type Chip } from "@/lib/chips";
import ChipItem from "@/components/ChipItem";

export default function Playground() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const [boxSize, setBoxSize] = useState<BoxSize>({ width: 800, height: 500 });
  // const [rects, setRects] = useState<Rect[]>([]);
  const [Chips, setChips] = useState<Chip[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = boxRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setChips((prev) => selectClosestRect(prev, mx, my));
  };

  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;

    const measure = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const nextBox = { width, height };

      setBoxSize(nextBox);
      //setRects(createRects(8, width, height));
      setChips(createChips(8, width, height));
    };

    measure();
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (Chips.length === 0) return;

    const animate = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
      }

      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      setChips((prev) => updateRects(prev, dt, boxSize));
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      lastTimeRef.current = null;
    };
  }, [boxSize, Chips.length]);

  return (
    <div 
      ref={boxRef} 
      onClick={handleClick}
      className="relative h-[770px] w-full overflow-hidden rounded-3xl border-4 border-black bg-neutral-100"
    >
      {Chips.map((chip) => (
        <ChipItem key={chip.id} chip={chip} />
      ))}
      {/* {rects.map((rect) => (
        <div
            key={rect.id}
            className={`absolute rounded-xl border shadow-sm transition-transform ${
            rect.state.kind === "selected" ? "bg-red-300" : "bg-blue-200"
            }`}
            style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                transform: `scale(${rect.scale})`,
            }}
        />
      ))} */}
    </div>
  );
}