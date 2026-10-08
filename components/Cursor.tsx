"use client";
import { useEffect, useRef } from "react";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX; y = e.clientY;
      const t = e.target as HTMLElement;
      const interactive = t.closest("a,button,[role=button],label,select,summary,.cursor-hover");
      const text = t.closest("input,textarea,[contenteditable]");
      const dark = t.closest("[data-dark]");
      ring.current?.classList.toggle("hover", !!interactive && !text);
      ring.current?.classList.toggle("text", !!text);
      dot.current?.classList.toggle("text", !!text);
      ring.current?.classList.toggle("dark", !!dark);
    };
    const down = () => ring.current?.classList.add("down");
    const up = () => ring.current?.classList.remove("down");
    const leave = () => { if (dot.current) dot.current.style.opacity = "0"; if (ring.current) ring.current.style.opacity = "0"; };
    const enter = () => { if (dot.current) dot.current.style.opacity = ""; if (ring.current) ring.current.style.opacity = ""; };
    const loop = () => {
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px,${y}px,0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
      document.body.classList.remove("has-cursor");
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring hidden md:block" aria-hidden />
      <div ref={dot} className="cursor-dot hidden md:block" aria-hidden />
    </>
  );
}
