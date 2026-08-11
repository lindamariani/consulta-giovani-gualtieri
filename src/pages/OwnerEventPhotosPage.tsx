import {
  ArrowLeft,
  Film,
  ImagePlus,
  Trash2,
  Upload,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import * as tus from "tus-js-client";

import { supabase } from "../lib/supabase";

import type {
  EventMediaOrientation,
  EventMediaRecord,
  EventMediaType,
} from "../types/event";

const BUCKET_NAME =
  "event-gallery";

const STANDARD_UPLOAD_LIMIT =
  6 * 1024 * 1024;

const MAX_IMAGE_SIZE =
  50 * 1024 * 1024;

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
];

type EventInfo = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
};

type MediaMetadata = {
  media_type: EventMediaType;
  width: number;
  height: number;
  aspect_ratio: number;
  orientation:
    EventMediaOrientation;
};

type NewMediaRow = {
  event_id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
  media_type: EventMediaType;
  width: number;
  height: number;
  aspect_ratio: number;
  orientation:
    EventMediaOrientation;
};

function extractStoragePath(
  publicUrl: string,
  bucket: string
) {
  const marker =
    `/storage/v1/object/public/${bucket}/`;

  const index =
    publicUrl.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(
    publicUrl.slice(
      index + marker.length
    )
  );
}

function getOrientation(
  width: number,
  height: number
): EventMediaOrientation {
  const ratio =
    width / height;

  if (ratio <= 0.82) {
    return "vertical";
  }

  if (ratio >= 1.22) {
    return "horizontal";
  }

  return "square";
}

function getFileMetadata(
  file: File
): Promise<MediaMetadata> {
  const objectUrl =
    URL.createObjectURL(file);

  if (
    SUPPORTED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    return new Promise(
      (resolve, reject) => {
        const image =
          new Image();

        image.onload = () => {
          const width =
            image.naturalWidth;

          const height =
            image.naturalHeight;

          URL.revokeObjectURL(
            objectUrl
          );

          if (
            !width ||
            !height
          ) {
            reject(
              new Error(
                "Dimensioni immagine non valide."
              )
            );

            return;
          }

          resolve({
            media_type:
              "image",

            width,
            height,

            aspect_ratio:
              width / height,

            orientation:
              getOrientation(
                width,
                height
              ),
          });
        };

        image.onerror = () => {
          URL.revokeObjectURL(
            objectUrl
          );

          reject(
            new Error(
              "Non riesco a leggere l'immagine."
            )
          );
        };

        image.src =
          objectUrl;
      }
    );
  }

  return new Promise(
    (resolve, reject) => {
      const video =
        document.createElement(
          "video"
        );

      video.preload =
        "metadata";

      video.muted = true;

      video.playsInline =
        true;

      video.onloadedmetadata =
        () => {
          const width =
            video.videoWidth;

          const height =
            video.videoHeight;

          URL.revokeObjectURL(
            objectUrl
          );

          if (
            !width ||
            !height
          ) {
            reject(
              new Error(
                "Dimensioni video non valide."
              )
            );

            return;
          }

          resolve({
            media_type:
              "video",

            width,
            height,

            aspect_ratio:
              width / height,

            orientation:
              getOrientation(
                width,
                height
              ),
          });
        };

      video.onerror = () => {
        URL.revokeObjectURL(
          objectUrl
        );

        reject(
          new Error(
            "Non riesco a leggere il video. Usa MP4 o WebM."
          )
        );
      };

      video.src =
        objectUrl;
    }
  );
}

async function uploadWithTus(
  file: File,
  storagePath: string,
  onProgress: (
    percentage: number
  ) => void
) {
  const {
    data: {
      session,
    },
  } =
    await supabase.auth.getSession();

  if (!session) {
    throw new Error(
      "Sessione scaduta."
    );
  }

  const supabaseUrl =
    import.meta.env
      .VITE_SUPABASE_URL as string;

  const projectId =
    new URL(
      supabaseUrl
    ).hostname.split(".")[0];

  await new Promise<void>(
    (resolve, reject) => {
      const upload =
        new tus.Upload(
          file,
          {
            endpoint:
              `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,

            retryDelays: [
              0,
              3000,
              5000,
              10000,
              20000,
            ],

            headers: {
              authorization:
                `Bearer ${session.access_token}`,

              "x-upsert":
                "false",
            },

            uploadDataDuringCreation:
              true,

            removeFingerprintOnSuccess:
              true,

            metadata: {
              bucketName:
                BUCKET_NAME,

              objectName:
                storagePath,

              contentType:
                file.type,

              cacheControl:
                "3600",
            },

            chunkSize:
              6 *
              1024 *
              1024,

            onError: (
              uploadError
            ) => {
              reject(
                uploadError
              );
            },

            onProgress: (
              bytesUploaded,
              bytesTotal
            ) => {
              const percentage =
                bytesTotal > 0
                  ? Math.round(
                      (bytesUploaded /
                        bytesTotal) *
                        100
                    )
                  : 0;

              onProgress(
                percentage
              );
            },

            onSuccess: () => {
              onProgress(100);
              resolve();
            },
          }
        );

      upload
        .findPreviousUploads()
        .then(
          (
            previousUploads
          ) => {
            if (
              previousUploads.length >
              0
            ) {
              upload.resumeFromPreviousUpload(
                previousUploads[0]
              );
            }

            upload.start();
          }
        )
        .catch(reject);
    }
  );
}

async function uploadStorageFile(
  file: File,
  storagePath: string,
  onProgress: (
    percentage: number
  ) => void
) {
  if (
    file.size >
    STANDARD_UPLOAD_LIMIT
  ) {
    await uploadWithTus(
      file,
      storagePath,
      onProgress
    );

    return;
  }

  onProgress(10);

  const {
    error:
      uploadError,
  } =
    await supabase.storage
      .from(BUCKET_NAME)
      .upload(
        storagePath,
        file,
        {
          cacheControl:
            "3600",

          contentType:
            file.type,

          upsert: false,
        }
      );

  if (uploadError) {
    throw uploadError;
  }

  onProgress(100);
}

function OwnerEventPhotosPage() {
  const { id } =
    useParams();

  const navigate =
    useNavigate();

  const [
    event,
    setEvent,
  ] =
    useState<EventInfo | null>(
      null
    );

  const [
    media,
    setMedia,
  ] =
    useState<
      EventMediaRecord[]
    >([]);

  const [
    selectedFiles,
    setSelectedFiles,
  ] =
    useState<File[]>([]);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] =
    useState(0);

  const [
    uploadingFile,
    setUploadingFile,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState("");

  useEffect(() => {
    if (!id) {
      navigate(
        "/owner/eventi"
      );

      return;
    }

    const loadData =
      async () => {
        setLoading(true);
        setError("");

        const {
          data: {
            user,
          },
        } =
          await supabase.auth.getUser();

        if (!user) {
          navigate(
            "/owner/login",
            {
              replace: true,
            }
          );

          return;
        }

        const {
          data:
            profile,
          error:
            profileError,
        } =
          await supabase
            .from(
              "profiles"
            )
            .select(
              "role"
            )
            .eq(
              "id",
              user.id
            )
            .single();

        if (
          profileError ||
          profile?.role !==
            "owner"
        ) {
          await supabase.auth.signOut();

          navigate(
            "/owner/login",
            {
              replace: true,
            }
          );

          return;
        }

        const {
          data:
            eventData,
          error:
            eventError,
        } =
          await supabase
            .from(
              "events"
            )
            .select(
              "id, title, slug, event_date"
            )
            .eq(
              "id",
              id
            )
            .single();

        if (
          eventError ||
          !eventData
        ) {
          console.error(
            eventError
          );

          setError(
            "Evento non trovato."
          );

          setLoading(false);

          return;
        }

        setEvent(
          eventData
        );

        const {
          data:
            mediaData,
          error:
            mediaError,
        } =
          await supabase
            .from(
              "event_photos"
            )
            .select("*")
            .eq(
              "event_id",
              id
            )
            .order(
              "sort_order",
              {
                ascending:
                  true,
              }
            )
            .order(
              "created_at",
              {
                ascending:
                  true,
              }
            );

        if (mediaError) {
          console.error(
            mediaError
          );

          setError(
            "Non riesco a caricare i media."
          );

          setLoading(false);

          return;
        }

        setMedia(
          (mediaData ??
            []) as EventMediaRecord[]
        );

        setLoading(false);
      };

    loadData();
  }, [
    id,
    navigate,
  ]);

  const handleFileSelection = (
    files: FileList | null
  ) => {
    if (!files) {
      return;
    }

    const chosenFiles =
      Array.from(files);

    const validFiles =
      chosenFiles.filter(
        (file) => {
          const isImage =
            SUPPORTED_IMAGE_TYPES.includes(
              file.type
            );

          const isVideo =
            SUPPORTED_VIDEO_TYPES.includes(
              file.type
            );

          if (
            !isImage &&
            !isVideo
          ) {
            return false;
          }

          if (
            isImage &&
            file.size >
              MAX_IMAGE_SIZE
          ) {
            return false;
          }

          return true;
        }
      );

    if (
      validFiles.length !==
      chosenFiles.length
    ) {
      setError(
"Alcuni file sono stati ignorati. Sono accettati JPG, PNG e WebP fino a 50 MB."      );
    } else {
      setError("");
    }

    setSelectedFiles(
      validFiles
    );
  };

  const uploadMedia =
    async () => {
      if (
        !event ||
        selectedFiles.length ===
          0
      ) {
        return;
      }

      setUploading(true);
      setUploadProgress(0);
      setUploadingFile("");
      setError("");

      const uploadedPaths:
        string[] = [];

      try {
        const rows:
          NewMediaRow[] =
          [];

        for (
          let index = 0;
          index <
          selectedFiles.length;
          index++
        ) {
          const file =
            selectedFiles[
              index
            ];

          setUploadingFile(
            file.name
          );

          setUploadProgress(
            0
          );

          const metadata =
            await getFileMetadata(
              file
            );

          const extension =
            file.name
              .split(".")
              .pop()
              ?.toLowerCase() ||
            (metadata.media_type ===
            "video"
              ? "mp4"
              : "jpg");

          const storagePath =
            `${event.slug}/${crypto.randomUUID()}.${extension}`;

          await uploadStorageFile(
            file,
            storagePath,
            setUploadProgress
          );

          uploadedPaths.push(
            storagePath
          );

          const {
            data:
              publicUrlData,
          } =
            supabase.storage
              .from(
                BUCKET_NAME
              )
              .getPublicUrl(
                storagePath
              );

          rows.push({
            event_id:
              event.id,

            image_url:
              publicUrlData.publicUrl,

            storage_path:
              storagePath,

            sort_order:
              media.length +
              index,

            media_type:
              metadata.media_type,

            width:
              metadata.width,

            height:
              metadata.height,

            aspect_ratio:
              Number(
                metadata.aspect_ratio.toFixed(
                  4
                )
              ),

            orientation:
              metadata.orientation,
          });
        }

        const {
          error:
            insertError,
        } =
          await supabase
            .from(
              "event_photos"
            )
            .insert(
              rows
            );

        if (insertError) {
          if (
            uploadedPaths.length >
            0
          ) {
            const {
              error:
                cleanupError,
            } =
              await supabase.storage
                .from(
                  BUCKET_NAME
                )
                .remove(
                  uploadedPaths
                );

            if (cleanupError) {
              console.error(
                "Errore pulizia upload fallito:",
                cleanupError
              );
            }
          }

          throw insertError;
        }

        const {
          data:
            refreshed,
          error:
            refreshError,
        } =
          await supabase
            .from(
              "event_photos"
            )
            .select("*")
            .eq(
              "event_id",
              event.id
            )
            .order(
              "sort_order",
              {
                ascending:
                  true,
              }
            )
            .order(
              "created_at",
              {
                ascending:
                  true,
              }
            );

        if (refreshError) {
          throw refreshError;
        }

        setMedia(
          (refreshed ??
            []) as EventMediaRecord[]
        );

        setSelectedFiles(
          []
        );

        setUploadingFile(
          ""
        );

        setUploadProgress(
          0
        );
      } catch (err) {
        console.error(err);

        setError(
          "Errore durante il caricamento. Controlla il limite file del bucket Supabase e riprova."
        );
      }

      setUploading(false);
    };

  const deleteMedia =
    async (
      item: EventMediaRecord
    ) => {
      const label =
        item.media_type ===
        "video"
          ? "video"
          : "foto";

      const confirmed =
        window.confirm(
          `Vuoi eliminare questo ${label}?`
        );

      if (!confirmed) {
        return;
      }

      setError("");

      const storagePath =
        item.storage_path ??
        extractStoragePath(
          item.image_url,
          BUCKET_NAME
        );

      const {
        error:
          databaseError,
      } =
        await supabase
          .from(
            "event_photos"
          )
          .delete()
          .eq(
            "id",
            item.id
          );

      if (databaseError) {
        console.error(
          databaseError
        );

        setError(
          "Errore durante l'eliminazione del media."
        );

        return;
      }

      setMedia(
        (current) =>
          current.filter(
            (
              currentItem
            ) =>
              currentItem.id !==
              item.id
          )
      );

      if (storagePath) {
        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              BUCKET_NAME
            )
            .remove([
              storagePath,
            ]);

        if (storageError) {
          console.error(
            storageError
          );

          setError(
            "Il media è stato rimosso dalla gallery, ma non sono riuscito a cancellare il file dallo Storage."
          );
        }
      }
    };

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO MEDIA...
      </main>
    );
  }

  if (!event) {
    return (
      <main className="owner-loading">
        EVENTO NON TROVATO
      </main>
    );
  }

  const videoCount =
    media.filter(
      (item) =>
        item.media_type ===
        "video"
    ).length;

  const imageCount =
    media.length -
    videoCount;

  return (
    <main className="owner-event-photos-page">
      <div className="container owner-event-photos-container">
        <div className="owner-events-topbar">
          <Link
            to="/owner/foto"
            className="owner-events-back"
          >
            <ArrowLeft
              size={17}
            />
            Media
          </Link>

          <span>
            CONSULTA / MEDIA
          </span>
        </div>

        <div className="owner-photo-heading">
          <div>
            <span>
              GALLERY EVENTO
            </span>

            <h1>
              FOTO +
              <br />
              VIDEO.
            </h1>

            <p>
              {event.title}
            </p>
          </div>

          <div className="owner-photo-count">
            <strong>
              {media.length}
            </strong>

            <span>
              MEDIA · {imageCount} FOTO ·{" "}
              {videoCount} VIDEO
            </span>
          </div>
        </div>

        <section className="owner-photo-upload-section">
          <div className="owner-photo-section-title">
            <span>01</span>

            <div>
              <small>
                NUOVI MEDIA
              </small>

              <h2>
                SCEGLI I FILE.
              </h2>
            </div>
          </div>

          <label className="owner-gallery-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
              multiple
              onChange={(event) =>
                handleFileSelection(
                  event.target.files
                )
              }
            />

            <div className="owner-media-upload-icons">
              <ImagePlus
                size={35}
              />

              <Film
                size={35}
              />
            </div>

            <strong>
              FOTO O
              <br />
              VIDEO
            </strong>

            <span>
              Seleziona anche più
              file insieme. Il sito
              riconosce automaticamente
              formato e proporzioni.
            </span>
          </label>

          {selectedFiles.length >
            0 && (
            <>
              <div className="owner-selected-media-list">
                {selectedFiles.map(
                  (file) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                    >
                      <span>
                        {file.type.startsWith(
                          "video/"
                        )
                          ? "VIDEO"
                          : "FOTO"}
                      </span>

                      <strong>
                        {file.name}
                      </strong>
                    </div>
                  )
                )}
              </div>

              <div className="owner-selected-photos">
                <div>
                  <strong>
                    {
                      selectedFiles.length
                    }
                  </strong>

                  <span>
                    MEDIA SELEZIONATI
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    uploadMedia
                  }
                  disabled={
                    uploading
                  }
                >
                  <Upload
                    size={21}
                  />

                  {uploading
                    ? "CARICAMENTO..."
                    : "CARICA MEDIA"}
                </button>
              </div>
            </>
          )}

          {uploading &&
            uploadingFile && (
            <div className="owner-media-progress">
              <div>
                <span>
                  STO CARICANDO
                </span>

                <strong>
                  {uploadingFile}
                </strong>
              </div>

              <div className="owner-media-progress-track">
                <span
                  style={{
                    width:
                      `${uploadProgress}%`,
                  }}
                />
              </div>

              <b>
                {uploadProgress}%
              </b>
            </div>
          )}

          {error && (
            <div className="owner-event-form-error">
              {error}
            </div>
          )}
        </section>

        <section className="owner-photo-library">
          <div className="owner-photo-section-title">
            <span>02</span>

            <div>
              <small>
                GALLERY
              </small>

              <h2>
                MEDIA CARICATI.
              </h2>
            </div>
          </div>

          {media.length ===
          0 ? (
            <div className="owner-photo-empty">
              <ImagePlus
                size={38}
              />

              <strong>
                ANCORA NESSUN
                MEDIA.
              </strong>
            </div>
          ) : (
            <div className="owner-photo-grid owner-media-grid">
              {media.map(
                (
                  item,
                  index
                ) => (
                  <article
                    key={
                      item.id
                    }
                    className="owner-photo-card owner-media-card"
                  >
                    <div className="owner-media-preview">
                      {item.media_type ===
                      "video" ? (
                        <video
                          src={
                            item.image_url
                          }
                          muted
                          playsInline
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={
                            item.image_url
                          }
                          alt={`${event.title} ${
                            index + 1
                          }`}
                        />
                      )}

                      <span className="owner-media-type-badge">
                        {item.media_type ===
                        "video"
                          ? "VIDEO"
                          : "FOTO"}
                        {" · "}
                        {item.orientation ??
                          "AUTO"}
                      </span>
                    </div>

                    <div className="owner-photo-card-footer">
                      <span>
                        MEDIA{" "}
                        {String(
                          index +
                            1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          deleteMedia(
                            item
                          )
                        }
                        aria-label="Elimina media"
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default OwnerEventPhotosPage;
