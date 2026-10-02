import React, { useRef, useEffect, useState } from 'react';
import { VIDEO_REELS } from '../../data/videoData';

const VIDEO_DURATION_MS = 10000;
const FADE_DURATION_MS = 1200;

/**
 * HeroVideo — Full-screen cinematic background video engine
 * Auto-transitions between all local stock video reels smoothly without flickering.
 */
export default function HeroVideo({ opacity = 1 }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  // Stable refs for each video reel
  const videoRefs = useRef(VIDEO_REELS.map(() => React.createRef()));

  // Start videos silently
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      const el = ref.current;
      if (!el) return;
      el.muted = true;
      if (i === 0) el.play().catch(() => {});
    });
  }, []);

  // Auto-advance loop
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = (activeIndex + 1) % VIDEO_REELS.length;

      const nextEl = videoRefs.current[next]?.current;
      if (nextEl) {
        nextEl.muted = true;
        nextEl.currentTime = 0;
        nextEl.play().catch(() => {});
      }

      setFadingOut(true);

      setTimeout(() => {
        setActiveIndex(next);
        setFadingOut(false);
      }, FADE_DURATION_MS);
    }, VIDEO_DURATION_MS);

    return () => clearTimeout(timer);
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0" style={{ opacity }}>
      {/* Background dark gradient fallback */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 70%, rgba(0,60,100,0.5) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 20%, rgba(0,40,80,0.4) 0%, transparent 55%),
            linear-gradient(170deg, #000000 0%, #020d1f 40%, #050810 100%)
          `,
        }}
      />

      {/* Video layers with opacity crossfade */}
      {VIDEO_REELS.map((reel, i) => {
        const isActive = i === activeIndex;
        return (
          <video
            key={reel.id}
            ref={videoRefs.current[i]}
            src={reel.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: isActive ? (fadingOut ? 0.2 : 0.75) : 0,
              transition: `opacity ${FADE_DURATION_MS}ms ease-in-out`,
              zIndex: isActive ? 2 : 1,
            }}
          />
        );
      })}

      {/* Dark cinematic overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(0,0,0,0.6) 0%,
              rgba(0,0,0,0.3) 40%,
              rgba(0,0,0,0.65) 80%,
              rgba(0,0,0,0.9) 100%
            )
          `,
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </div>
  );
}
