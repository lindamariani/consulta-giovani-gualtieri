import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { EventMediaOrientation, EventMediaRecord } from "../types/event";

type Props = { media: EventMediaRecord; index: number; eventTitle: string };
const AUDIO_EVENT = "consulta-event-media-audio";
let activeVideo: HTMLVideoElement | null = null;
let raf = 0;

function chooseVisibleVideo() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = 0;
    const videos = Array.from(document.querySelectorAll<HTMLVideoElement>("video[data-event-gallery-video]"));
    let best: HTMLVideoElement | null = null;
    let bestScore = 0;
    if (!document.hidden) {
      for (const video of videos) {
        if (!video.getAttribute("src")) continue;
        const rect = video.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0));
        const fraction = visible / Math.max(1, rect.height);
        if (fraction < 0.25) continue;
        const score = fraction - Math.abs((rect.top + rect.bottom) / 2 - innerHeight / 2) / (innerHeight * 10);
        if (score > bestScore) { best = video; bestScore = score; }
      }
    }
    if (activeVideo !== best) {
      activeVideo?.pause();
      activeVideo = best;
    }
    // Non aspettare readyState: play() avvia anche un video che sta ancora caricando.
    if (best && best.paused) void best.play().catch(() => {});
  });
}

function orientationFromRatio(ratio: number | null): EventMediaOrientation {
  if (!ratio || !Number.isFinite(ratio)) return "square";
  if (ratio <= 0.82) return "vertical";
  if (ratio >= 1.22) return "horizontal";
  return "square";
}

export default function EventGalleryMedia({ media, index, eventTitle }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [loadVideo, setLoadVideo] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const [orientation, setOrientation] = useState<EventMediaOrientation>(
    media.orientation ?? orientationFromRatio(media.aspect_ratio)
  );

  useEffect(() => {
    if (media.media_type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    const loadObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoadVideo(true); loadObserver.disconnect(); }
    }, { rootMargin: "500px 0px" });
    loadObserver.observe(video);
    return () => loadObserver.disconnect();
  }, [media.id, media.media_type]);

  useEffect(() => {
    if (media.media_type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    const onAudio = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== media.id) {
        video.muted = true;
        setMuted(true);
      }
    };
    const onScroll = () => chooseVisibleVideo();
    window.addEventListener(AUDIO_EVENT, onAudio);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    document.addEventListener("visibilitychange", onScroll);
    chooseVisibleVideo();
    return () => {
      window.removeEventListener(AUDIO_EVENT, onAudio);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      document.removeEventListener("visibilitychange", onScroll);
      video.pause();
      if (activeVideo === video) activeVideo = null;
    };
  }, [media.id, media.media_type]);

  useEffect(() => { if (loadVideo) chooseVisibleVideo(); }, [loadVideo]);

  const toggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    setLoadVideo(true);
    activeVideo?.pause();
    activeVideo = video;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) window.dispatchEvent(new CustomEvent<string>(AUDIO_EVENT, { detail: media.id }));
    // Il click dell'utente deve avviare il video, senza ricalcolare subito il video visibile.
    void video.play().catch(() => {});
  };

  return (
    <article className={`event-media-card event-media-${orientation}`}>
      {media.media_type === "video" ? (
        <div className="event-media-video" onClick={toggleAudio}>
          <video
            ref={videoRef}
            data-event-gallery-video="true"
            src={loadVideo ? media.image_url : undefined}
            muted
            loop
            playsInline
            preload="metadata"
            onLoadedData={() => { setPreviewReady(true); chooseVisibleVideo(); }}
            onCanPlay={chooseVisibleVideo}
            onLoadedMetadata={(event) => {
              if (media.orientation) return;
              const { videoWidth, videoHeight } = event.currentTarget;
              if (videoWidth && videoHeight) setOrientation(orientationFromRatio(videoWidth / videoHeight));
            }}
            aria-label={media.caption ?? `${eventTitle} - video ${index + 1}`}
          />
          {!previewReady && (
            <span className="event-media-preview-loading" aria-hidden="true">
              ANTEPRIMA VIDEO IN CARICAMENTO
            </span>
          )}
          <button
            type="button"
            className="event-media-audio-button"
            onClick={(event) => { event.stopPropagation(); toggleAudio(); }}
            aria-label={muted ? "Attiva audio" : "Disattiva audio"}
          >
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span>{muted ? "AUDIO" : "MUTO"}</span>
          </button>
        </div>
      ) : (
        <img
          src={media.image_url}
          alt={media.caption ?? `${eventTitle} ${index + 1}`}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            if (media.orientation) return;
            const { naturalWidth, naturalHeight } = event.currentTarget;
            if (naturalWidth && naturalHeight) setOrientation(orientationFromRatio(naturalWidth / naturalHeight));
          }}
        />
      )}
      <span className="event-media-number">{String(index + 1).padStart(2, "0")}</span>
      {media.media_type === "video" && <span className="event-media-video-label">VIDEO</span>}
    </article>
  );
}
