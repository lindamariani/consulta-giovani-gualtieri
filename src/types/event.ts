export type EventCategory =
  | "consulta"
  | "comune"
  | "territorio";

export type EventTheme =
  | "green"
  | "lilac"
  | "yellow"
  | "pink"
  | "blue"
  | "cyan";

export type EventRecord = {
  id: string;

  slug: string;

  title: string;

  short_description:
    | string
    | null;

  description:
    | string
    | null;

  event_date: string;

  start_time:
    | string
    | null;

  end_time:
    | string
    | null;

  location:
    | string
    | null;

  organizer: string;

  category:
    EventCategory;

  theme:
    EventTheme;

  cover_url:
    | string
    | null;

  published: boolean;

  created_by:
    | string
    | null;

  created_at: string;

  updated_at: string;
};

export type EventMediaType =
  | "image"
  | "video";

export type EventMediaOrientation =
  | "vertical"
  | "square"
  | "horizontal";

export type EventMediaRecord = {
  id: string;
  event_id: string;
  image_url: string;
  storage_path:
    | string
    | null;
  caption:
    | string
    | null;
  sort_order: number;
  created_at: string;
  media_type:
    EventMediaType;
  width:
    | number
    | null;
  height:
    | number
    | null;
  aspect_ratio:
    | number
    | null;
  orientation:
    | EventMediaOrientation
    | null;
};

