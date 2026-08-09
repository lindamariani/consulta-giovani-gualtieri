import {
  ArrowLeft,
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

import { supabase } from "../lib/supabase";

type EventPhoto = {
  id: string;
  event_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
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

type EventInfo = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
};

function OwnerEventPhotosPage() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [event, setEvent] =
    useState<EventInfo | null>(null);

  const [photos, setPhotos] =
    useState<EventPhoto[]>([]);

  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([]);

  const [uploading, setUploading] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) {
      navigate("/owner/eventi");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError("");

      const {
        data: eventData,
        error: eventError,
      } = await supabase
        .from("events")
        .select(
          "id, title, slug, event_date"
        )
        .eq("id", id)
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

      setEvent(eventData);

      const {
        data: photoData,
        error: photoError,
      } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", id)
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: true,
        });

      if (photoError) {
        console.error(
          photoError
        );

        setError(
          "Non riesco a caricare le foto."
        );

        setLoading(false);

        return;
      }

      setPhotos(
        (photoData ??
          []) as EventPhoto[]
      );

      setLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const handleFileSelection = (
    files: FileList | null
  ) => {
    if (!files) return;

    const validFiles =
      Array.from(files).filter(
        (file) =>
          [
            "image/jpeg",
            "image/png",
            "image/webp",
          ].includes(file.type) &&
          file.size <=
            10 * 1024 * 1024
      );

    if (
      validFiles.length !==
      files.length
    ) {
      setError(
        "Alcuni file sono stati ignorati. Sono accettati JPG, PNG e WebP fino a 10 MB."
      );
    } else {
      setError("");
    }

    setSelectedFiles(
      validFiles
    );
  };

  const uploadPhotos =
    async () => {
      if (
        !event ||
        selectedFiles.length === 0
      ) {
        return;
      }

      setUploading(true);
      setError("");

      try {
        const uploadedPhotos: {
          event_id: string;
          image_url: string;
          storage_path: string;
          sort_order: number;
        }[] = [];

        const uploadedPaths:
          string[] = [];

        for (
          let index = 0;
          index <
          selectedFiles.length;
          index++
        ) {
          const file =
            selectedFiles[index];

          const extension =
            file.name
              .split(".")
              .pop()
              ?.toLowerCase() ||
            "jpg";

          const path =
            `${event.slug}/${crypto.randomUUID()}.${extension}`;

          const {
            error:
              uploadError,
          } =
            await supabase.storage
              .from(
                "event-gallery"
              )
              .upload(
                path,
                file,
                {
                  cacheControl:
                    "3600",
                  upsert: false,
                }
              );

          if (uploadError) {
            throw uploadError;
          }

          const { data } =
            supabase.storage
              .from(
                "event-gallery"
              )
              .getPublicUrl(
                path
              );

          uploadedPaths.push(
            path
          );

          uploadedPhotos.push({
            event_id:
              event.id,

            image_url:
              data.publicUrl,

            storage_path:
              path,

            sort_order:
              photos.length +
              index,
          });
        }

        const {
          error:
            insertError,
        } = await supabase
          .from(
            "event_photos"
          )
          .insert(
            uploadedPhotos
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
                  "event-gallery"
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
          data: refreshed,
          error:
            refreshError,
        } = await supabase
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
              ascending: true,
            }
          );

        if (refreshError) {
          throw refreshError;
        }

        setPhotos(
          (refreshed ??
            []) as EventPhoto[]
        );

        setSelectedFiles([]);
      } catch (err) {
        console.error(err);

        setError(
          "Errore durante il caricamento delle foto."
        );
      }

      setUploading(false);
    };

  const deletePhoto =
    async (
      photo: EventPhoto
    ) => {
      const confirmed =
        window.confirm(
          "Vuoi eliminare questa foto?"
        );

      if (!confirmed) {
        return;
      }

      setError("");

      const storagePath =
        photo.storage_path ??
        extractStoragePath(
          photo.image_url,
          "event-gallery"
        );

      const {
        error:
          databaseError,
      } = await supabase
        .from("event_photos")
        .delete()
        .eq("id", photo.id);

      if (databaseError) {
        console.error(
          databaseError
        );

        setError(
          "Errore durante l'eliminazione della foto."
        );

        return;
      }

      setPhotos(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              photo.id
          )
      );

      if (storagePath) {
        const {
          error:
            storageError,
        } =
          await supabase.storage
            .from(
              "event-gallery"
            )
            .remove([
              storagePath,
            ]);

        if (storageError) {
          console.error(
            storageError
          );

          setError(
            "La foto è stata rimossa dalla gallery, ma non sono riuscito a cancellare il file dallo Storage."
          );
        }
      }
    };

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO FOTO...
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

  return (
    <main className="owner-event-photos-page">
      <div className="container owner-event-photos-container">
        <div className="owner-events-topbar">
          <Link
            to="/owner/eventi"
            className="owner-events-back"
          >
            <ArrowLeft size={17} />
            Eventi
          </Link>

          <span>
            CONSULTA / FOTO
          </span>
        </div>

        <div className="owner-photo-heading">
          <div>
            <span>
              GALLERY EVENTO
            </span>

            <h1>
              CARICA
              <br />
              LE FOTO.
            </h1>

            <p>
              {event.title}
            </p>
          </div>

          <div className="owner-photo-count">
            <strong>
              {photos.length}
            </strong>

            <span>
              FOTO
            </span>
          </div>
        </div>

        <section className="owner-photo-upload-section">
          <div className="owner-photo-section-title">
            <span>01</span>

            <div>
              <small>
                NUOVE FOTO
              </small>

              <h2>
                SCEGLI I FILE.
              </h2>
            </div>
          </div>

          <label className="owner-gallery-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) =>
                handleFileSelection(
                  e.target.files
                )
              }
            />

            <ImagePlus
              size={39}
            />

            <strong>
              SELEZIONA
              <br />
              LE FOTO
            </strong>

            <span>
              Puoi selezionarne
              più di una
            </span>
          </label>

          {selectedFiles.length >
            0 && (
            <div className="owner-selected-photos">
              <div>
                <strong>
                  {
                    selectedFiles.length
                  }
                </strong>

                <span>
                  FOTO SELEZIONATE
                </span>
              </div>

              <button
                type="button"
                onClick={
                  uploadPhotos
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
                  : "CARICA FOTO"}
              </button>
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
                FOTO CARICATE.
              </h2>
            </div>
          </div>

          {photos.length ===
          0 ? (
            <div className="owner-photo-empty">
              <ImagePlus
                size={38}
              />

              <strong>
                ANCORA NESSUNA
                FOTO.
              </strong>
            </div>
          ) : (
            <div className="owner-photo-grid">
              {photos.map(
                (
                  photo,
                  index
                ) => (
                  <article
                    key={
                      photo.id
                    }
                    className="owner-photo-card"
                  >
                    <img
                      src={
                        photo.image_url
                      }
                      alt={`${event.title} ${
                        index + 1
                      }`}
                    />

                    <div className="owner-photo-card-footer">
                      <span>
                        FOTO{" "}
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
                          deletePhoto(
                            photo
                          )
                        }
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