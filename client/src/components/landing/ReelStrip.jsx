import React from 'react';

export default function ReelStrip({ reels, activeVideo, onSelectVideo, progress, isPlaying, onTogglePlay }) {
  return (
    <div className="flex items-end gap-2 w-full">
      {reels.map((reel) => {
        const isActive = reel.id === activeVideo.id;
        return (
          <button
            key={reel.id}
            onClick={() => onSelectVideo(reel)}
            className={`group relative flex-1 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
              isActive ? 'h-16 ring-1 ring-white/50' : 'h-12 opacity-60 hover:opacity-90 hover:h-14'
            }`}
          >
            {/* Thumbnail video preview */}
            <video
              src={reel.videoSrc}
              muted loop playsInline autoPlay
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay */}
            <div className={`absolute inset-0 transition-colors ${isActive ? 'bg-black/20' : 'bg-black/40 group-hover:bg-black/25'}`} />

            {/* Label */}
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
              <span className="text-[9px] font-tech text-white/90 tracking-widest uppercase truncate">
                {reel.code} — {reel.title}
              </span>
            </div>

            {/* Active progress bar */}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
