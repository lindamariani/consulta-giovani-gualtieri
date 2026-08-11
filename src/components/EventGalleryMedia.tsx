import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Volume2,
  VolumeX,
} from "lucide-react";

import type {
  EventMediaOrientation,
  EventMediaRecord,
} from "../types/event";

type Props = {
  media: EventMediaRecord;
  index: number;
  eventTitle: string;
};

const AUDIO_EVENT =
  "consulta-event-media-audio";

function getOrientationFromRatio(
  ratio: number | null
): EventMediaOrientation {
  if (!ratio || !Number.isFinite(ratio)) {
    return "square";
  }

  if (ratio <= 0.82) {
    return "vertical";
  }

  if (ratio >= 1.22) {
    return "horizontal";
  }

  return "square";
}

function EventGalleryMedia({
  media,
  index,
  eventTitle,
}: Props) {
  const videoRef =
    useRef<HTMLVideoElement | null>(
      null
    );

  const [muted, setMuted] =
    useState(true);

  const [
    detectedOrientation,
    setDetectedOrientation,
  ] =
    useState<EventMediaOrientation>(
      media.orientation ??
        getOrientationFromRatio(
          media.aspect_ratio
        )
    );

  useEffect(() => {
    if (media.media_type !== "video") {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio >=
              0.35
          ) {
            video
              .play()
              .catch(() => {
                // Alcuni browser possono
                // rimandare l'autoplay.
              });

            return;
          }

          video.pause();
        },
        {
          threshold: [
            0,
            0.35,
            0.75,
          ],
        }
      );

    observer.observe(video);

    const muteOtherVideos = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<string>;

      if (
        customEvent.detail !==
        media.id
      ) {
        video.muted = true;
        setMuted(true);
      }
    };

    window.addEventListener(
      AUDIO_EVENT,
      muteOtherVideos
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        AUDIO_EVENT,
        muteOtherVideos
      );
    };
  }, [
    media.id,
    media.media_type,
  ]);

  const toggleAudio = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMuted =
      !video.muted;

    video.muted = nextMuted;

    setMuted(nextMuted);

    if (!nextMuted) {
      window.dispatchEvent(
        new CustomEvent<string>(
          AUDIO_EVENT,
          {
            detail: media.id,
          }
        )
      );
    }

    if (video.paused) {
      await video
        .play()
        .catch(() => undefined);
    }
  };

  const label = String(
    index + 1
  ).padStart(2, "0");

  return (
    <article
      className={`event-media-card event-media-${detectedOrientation}`}
    >
      {media.media_type ===
      "video" ? (
        <div
          className="event-media-video"
          onClick={
            toggleAudio
          }
        >
          <video
            ref={videoRef}
            src={media.image_url}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={
              media.caption ??
              `${eventTitle} - video ${index + 1}`
            }
            onLoadedMetadata={(
              event
            ) => {
              if (
                media.orientation
              ) {
                return;
              }

              const {
                videoWidth,
                videoHeight,
              } =
                event.currentTarget;

              if (
                videoWidth > 0 &&
                videoHeight > 0
              ) {
                setDetectedOrientation(
                  getOrientationFromRatio(
                    videoWidth /
                      videoHeight
                  )
                );
              }
            }}
          />

          <button
            type="button"
            className="event-media-audio-button"
            onClick={(event) => {
              event.stopPropagation();
              toggleAudio();
            }}
            aria-label={
              muted
                ? "Attiva audio"
                : "Disattiva audio"
            }
          >
            {muted ? (
              <VolumeX
                size={17}
              />
            ) : (
              <Volume2
                size={17}
              />
            )}

            <span>
              {muted
                ? "AUDIO"
                : "MUTO"}
            </span>
          </button>
        </div>
      ) : (
        <img
          src={media.image_url}
          alt={
            media.caption ??
            `${eventTitle} ${index + 1}`
          }
          loading="lazy"
          onLoad={(event) => {
            if (
              media.orientation
            ) {
              return;
            }

            const {
              naturalWidth,
              naturalHeight,
            } =
              event.currentTarget;

            if (
              naturalWidth > 0 &&
              naturalHeight > 0
            ) {
              setDetectedOrientation(
                getOrientationFromRatio(
                  naturalWidth /
                    naturalHeight
                )
              );
            }
          }}
        />
      )}

      <span className="event-media-number">
        {label}
      </span>

      {media.media_type ===
        "video" && (
        <span className="event-media-video-label">
          VIDEO
        </span>
      )}
    </article>
  );
}

export default EventGalleryMedia;
