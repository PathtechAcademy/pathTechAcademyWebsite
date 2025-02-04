import React, { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Prevent downloading
    video.addEventListener('contextmenu', (e) => e.preventDefault());

    // Add encrypted source with timestamp to prevent caching
    const encryptedUrl = `${url}?token=${Date.now()}`;
    video.src = encryptedUrl;

    // Track video progress
    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      video.dataset.progress = progress.toString();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('contextmenu', (e) => e.preventDefault());
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [url]);

  return (
    <div className="relative">
      <video
        ref={videoRef}
        className="w-full rounded-lg"
        controls
        controlsList="nodownload"
        playsInline
        title={title}
      >
        <track kind="captions" />
      </video>
      <div className="absolute inset-0 pointer-events-none" />
    </div>
  );
}