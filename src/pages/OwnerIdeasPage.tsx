import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Lightbulb,
  Mail,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../lib/supabase";

type Idea = {
  id: string;

  category:
    | string
    | null;

  idea:
    | string
    | null;

  age_range:
    | string
    | null;

  anonymous: boolean;

  sender_name:
    | string
    | null;

  contact:
    | string
    | null;

  allow_publish:
    boolean;

  status: string;

  created_at:
    string;
};

function OwnerIdeasPage() {
  const navigate =
    useNavigate();

  const [
    ideas,
    setIdeas,
  ] =
    useState<Idea[]>([]);

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

  const [
    filter,
    setFilter,
  ] =
    useState<
      "all" |
      "new" |
      "read"
    >("all");

  useEffect(() => {
    const loadIdeas =
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
            "/owner/login"
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
            "/owner/login"
          );

          return;
        }

        const {
          data,
          error:
            ideasError,
        } =
          await supabase
            .from(
              "ideas"
            )
            .select("*")
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            );

        if (
          ideasError
        ) {
          console.error(
            ideasError
          );

          setError(
            "Non riesco a caricare le idee."
          );

          setLoading(
            false
          );

          return;
        }

        setIdeas(
          (data ??
            []) as Idea[]
        );

        setLoading(
          false
        );
      };

    loadIdeas();
  }, [navigate]);

  const filteredIdeas =
    useMemo(() => {
      if (
        filter ===
        "all"
      ) {
        return ideas;
      }

      return ideas.filter(
        (idea) =>
          idea.status ===
          filter
      );
    }, [
      ideas,
      filter,
    ]);

  const newIdeasCount =
    ideas.filter(
      (idea) =>
        idea.status ===
        "new"
    ).length;

  const toggleRead =
    async (
      idea: Idea
    ) => {
      const newStatus =
        idea.status ===
        "new"
          ? "read"
          : "new";

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            "ideas"
          )
          .update({
            status:
              newStatus,
          })
          .eq(
            "id",
            idea.id
          );

      if (
        updateError
      ) {
        console.error(
          updateError
        );

        setError(
          "Errore durante la modifica dell'idea."
        );

        return;
      }

      setIdeas(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              idea.id
                ? {
                    ...item,
                    status:
                      newStatus,
                  }
                : item
          )
      );
    };

  const deleteIdea =
    async (
      idea: Idea
    ) => {
      const confirmed =
        window.confirm(
          "Vuoi eliminare definitivamente questa idea?"
        );

      if (!confirmed) {
        return;
      }

      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "ideas"
          )
          .delete()
          .eq(
            "id",
            idea.id
          );

      if (
        deleteError
      ) {
        console.error(
          deleteError
        );

        setError(
          "Errore durante l'eliminazione dell'idea."
        );

        return;
      }

      setIdeas(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              idea.id
          )
      );
    };

  if (loading) {
    return (
      <main className="owner-loading">
        CARICAMENTO IDEE...
      </main>
    );
  }

  return (
    <main className="owner-ideas-page">
      <div className="container owner-ideas-container">

        <div className="owner-events-topbar">
          <Link
            to="/owner"
            className="owner-events-back"
          >
            <ArrowLeft
              size={17}
            />

            Dashboard
          </Link>

          <span>
            CONSULTA / IDEE
          </span>
        </div>

        <div className="owner-ideas-heading">

          <div>
            <span>
              PROPOSTE RICEVUTE
            </span>

            <h1>
              LE VOSTRE
              <br />
              IDEE.
            </h1>

            <p>
              Qui trovi tutte le
              proposte inviate dal
              sito.
            </p>
          </div>

          <div className="owner-ideas-counter">

            <Lightbulb
              size={30}
            />

            <strong>
              {
                newIdeasCount
              }
            </strong>

            <span>
              NUOVE
            </span>

          </div>
        </div>

        <div className="owner-ideas-filters">

          <button
            type="button"
            className={
              filter ===
              "all"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "all"
              )
            }
          >
            TUTTE
            <span>
              {
                ideas.length
              }
            </span>
          </button>

          <button
            type="button"
            className={
              filter ===
              "new"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "new"
              )
            }
          >
            NUOVE
            <span>
              {
                newIdeasCount
              }
            </span>
          </button>

          <button
            type="button"
            className={
              filter ===
              "read"
                ? "active"
                : ""
            }
            onClick={() =>
              setFilter(
                "read"
              )
            }
          >
            LETTE
          </button>

        </div>

        {error && (
          <div className="owner-event-form-error">
            {error}
          </div>
        )}

        {filteredIdeas.length ===
        0 ? (
          <div className="owner-ideas-empty">

            <Lightbulb
              size={48}
            />

            <strong>
              NESSUNA IDEA.
            </strong>

            <span>
              Non ci sono proposte
              in questa sezione.
            </span>

          </div>
        ) : (
          <div className="owner-ideas-list">

            {filteredIdeas.map(
              (
                item
              ) => (
                <article
                  key={
                    item.id
                  }
                  className={`owner-idea-card ${
                    item.status ===
                    "new"
                      ? "owner-idea-new"
                      : ""
                  }`}
                >

                  <div className="owner-idea-top">

                    <div className="owner-idea-badges">

                      <span>
                        {item.category ||
                          "altro"}
                      </span>

                      <span
                        className={
                          item.status ===
                          "new"
                            ? "new"
                            : "read"
                        }
                      >
                        {item.status ===
                        "new"
                          ? "NUOVA"
                          : "LETTA"}
                      </span>

                      {item.allow_publish && (
                        <span className="publishable">
                          PUBBLICABILE
                        </span>
                      )}

                    </div>

                    <span className="owner-idea-date">
                      {new Date(
                        item.created_at
                      ).toLocaleDateString(
                        "it-IT",
                        {
                          day:
                            "2-digit",
                          month:
                            "short",
                          year:
                            "numeric",
                        }
                      )}
                    </span>

                  </div>

                  <p className="owner-idea-text">
                    “
                    {item.idea}
                    ”
                  </p>

                  <div className="owner-idea-info">

                    <div>
                      <small>
                        ETÀ
                      </small>

                      <strong>
                        {item.age_range ||
                          "Non indicata"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        INVIO
                      </small>

                      <strong>
                        {item.anonymous
                          ? "Anonimo"
                          : "Con contatto"}
                      </strong>
                    </div>

                  </div>

                  {!item.anonymous && (
                    <div className="owner-idea-contact">

                      <div>
                        <UserRound
                          size={16}
                        />

                        <span>
                          {item.sender_name ||
                            "Nome non indicato"}
                        </span>
                      </div>

                      {item.contact && (
                        <div>
                          <Mail
                            size={16}
                          />

                          <span>
                            {
                              item.contact
                            }
                          </span>
                        </div>
                      )}

                    </div>
                  )}

                  <div className="owner-idea-actions">

                    <button
                      type="button"
                      onClick={() =>
                        toggleRead(
                          item
                        )
                      }
                    >
                      {item.status ===
                      "new" ? (
                        <>
                          <Check
                            size={17}
                          />

                          SEGNA COME LETTA
                        </>
                      ) : (
                        <>
                          <EyeOff
                            size={17}
                          />

                          SEGNA COME NUOVA
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="owner-idea-delete"
                      onClick={() =>
                        deleteIdea(
                          item
                        )
                      }
                    >
                      <Trash2
                        size={17}
                      />

                      ELIMINA
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>
    </main>
  );
}

export default OwnerIdeasPage;