import React, { useEffect, useRef } from 'react';

export const CursorTrail: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trailer = trailerRef.current;

    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      if (cursor) {
        cursor.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      
      if (trailer) {
        trailer.animate({
            transform: `translate3d(${clientX}px, ${clientY}px, 0)`
        }, {
            duration: 500,
            fill: "forwards"
        });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] mix-blend-difference hidden md:block">
      {/* Main Dot */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-3 h-3 bg-white rounded-full -mt-1.5 -ml-1.5 shadow-[0_0_10px_#fff]"
      />
      {/* Lagging Ring */}
      <div 
        ref={trailerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full -mt-4 -ml-4 transition-transform duration-75 ease-out"
      />
    </div>
  );
};