export type EventCategory = "consulta" | "comune" | "territorio";

export type Event = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  date: string;
  displayDate: string;
  time: string;
  location: string;
  category: EventCategory;
  organizer: string;
  past: boolean;
  theme: "green" | "lilac" | "yellow" | "pink" | "blue" | "cyan";
  cover?: string;
  gallery?: string[];
};

export const events: Event[] = [
  {
    id: "aperitivo-sotto-le-stelle",
    title: "Aperitivo sotto le stelle",
    shortDescription:
      "Musica, drink e una serata insieme nel cuore di Gualtieri.",
    description:
      "Una serata organizzata dalla Consulta Giovani di Gualtieri per stare insieme, bere qualcosa e godersi una serata estiva in paese.",
    date: "2026-08-23",
    displayDate: "23 AGO",
    time: "19:00",
    location: "Gualtieri",
    category: "consulta",
    organizer: "Consulta Giovani",
    past: false,
    theme: "green",
  },
  {
    id: "musica-in-piazza",
    title: "Musica in Piazza",
    shortDescription:
      "Una serata di musica live nel centro di Gualtieri.",
    description:
      "Evento musicale organizzato nel centro di Gualtieri con musica dal vivo e iniziative aperte alla cittadinanza.",
    date: "2026-08-30",
    displayDate: "30 AGO",
    time: "21:00",
    location: "Piazza Bentivoglio",
    category: "comune",
    organizer: "Comune di Gualtieri",
    past: false,
    theme: "lilac",
  },
  {
    id: "festa-del-pesce",
    title: "Festa del Pesce",
    shortDescription:
      "Una delle feste storiche di Gualtieri tra cucina e convivialità.",
    description:
      "Una delle manifestazioni storiche di Gualtieri, organizzata dagli Amici Bar Parigi con il supporto di volontari e realtà del territorio.",
    date: "2026-09-06",
    displayDate: "06 SET",
    time: "18:30",
    location: "Gualtieri",
    category: "territorio",
    organizer: "Amici Bar Parigi",
    past: false,
    theme: "yellow",
  },

  {
    id: "kiss-my-ace-2026",
    title: "Kiss My Ace",
    shortDescription:
      "Torneo di green volley, musica, cucina e bar per tutta la giornata.",
    description:
      "Una giornata dedicata al green volley organizzata dalla Consulta Giovani di Gualtieri, con squadre, musica, cucina, bar e premi.",
    date: "2026-06-13",
    displayDate: "13 GIU",
    time: "10:00",
    location: "Campo sportivo Gualtierese",
    category: "consulta",
    organizer: "Consulta Giovani",
    past: true,
    theme: "green",
  },
  {
    id: "aperitivoglio-maggio",
    title: "Aperitivoglio",
    shortDescription:
      "Box aperitivo, drink, musica e giochi sotto la Torre.",
    description:
      "Un pomeriggio organizzato dalla Consulta Giovani in Piazza Bentivoglio con box aperitivo, drink, musica e attività.",
    date: "2026-05-10",
    displayDate: "10 MAG",
    time: "17:00",
    location: "Piazza Bentivoglio",
    category: "consulta",
    organizer: "Consulta Giovani",
    past: true,
    theme: "pink",
  },
  {
    id: "aperitiv8-marzo",
    title: "Aperitiv8",
    shortDescription:
      "Aperitivo, drink e ruota della fortuna in Piazza Bentivoglio.",
    description:
      "Uno degli appuntamenti della Consulta Giovani dedicati ai ragazzi del territorio, con aperitivo e attività durante il pomeriggio.",
    date: "2026-03-08",
    displayDate: "08 MAR",
    time: "17:00",
    location: "Piazza Bentivoglio",
    category: "consulta",
    organizer: "Consulta Giovani",
    past: true,
    theme: "lilac",
  },
];