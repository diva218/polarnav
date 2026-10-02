import React, { useRef, useEffect } from 'react';

export default function VideoBackground({ activeVideo, isMuted = true }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        ref={videoRef}
        src={activeVideo.videoSrc}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Thin edge fades only — video stays very visible */}
      {/* Bottom fade for text readability */}
      <div className="absolute bottom-0 left-0 right-0 h-52 bg-gradient-to-t from-black/75 to-transparent" />
      {/* Top fade for nav */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />
    </div>
  );
}
