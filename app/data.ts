export interface Church {
  borough: string;
  name: string;
  tradition: string;
  languages: string;
  priest: string;
  website: string;
  email: string;
  phone: string;
  map: string;
  transit: string;
  services: string[];
}

export interface CalendarEvent {
  title: string;
  start: string;
  end: string;
}

export interface Moment {
  id: string;
  label: string;
  title: string;
  image: string;
  alt: string;
  details: string;
}

export const churches: Church[] = [
  {
    borough: "Bronx",
    name: "Beata Le Mariam Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "English, Amharic, Ge'ez",
    priest: "Abba Ephreim",
    website: "https://nybeaataeotc.org/",
    email: "mariam@nybeaataeotc.org",
    phone: "",
    map: "https://maps.app.goo.gl/5VMwvjtNotP4qgte8",
    transit: "1 minute walk from the 6 train - Cypress Ave stop",
    services: ["Divine Liturgy on Sundays: 7-11 AM"],
  },
  {
    borough: "Bronx",
    name: "Medhanyalem Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "Amharic, Ge'ez",
    priest: "Kesis Berhanu",
    website: "http://www.medhanialem.org/",
    email: "contactEOTCOS@medhanialem.org",
    phone: "(347) 947-4361",
    map: "https://maps.app.goo.gl/7zYJcaKH34WjVu838",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Prayer of the Covenant (Kidan) on Saturdays: 7-8:30 AM", "Divine Liturgy on Sundays: 7-11 AM"],
  },
  {
    borough: "Bronx",
    name: "Holy Trinity Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "English, Amharic, Ge'ez",
    priest: "Kesis Ephrem",
    website: "",
    email: "info@holytrinityeotcny.org",
    phone: "(718) 299-2741",
    map: "https://maps.app.goo.gl/adticJM7QQWvm7Kf8",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Prayer of Covenant (Kidane) on Saturdays: 7-8:30 AM", "Divine Liturgy on Sundays: 7-11 AM"],
  },
  {
    borough: "Brooklyn",
    name: "Saint George Ethiopian Orthodox Tewahedo Church",
    tradition: "Ethiopian Orthodox Tewahedo",
    languages: "English, Ge'ez",
    priest: "Kesis Mahitama Selassie",
    website: "https://stgeorgeeotc.vercel.app/",
    email: "msstgeorge.eotc.ny@gmail.com",
    phone: "+1 516 343 1873",
    map: "https://maps.app.goo.gl/oRDas7EmtLmqBcZX7",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: [
      "7-10:30 AM",
      "Divine Liturgy is usually once a month according to the website calendar. Other Sundays may be Prayer of the Covenant.",
    ],
  },
  {
    borough: "Manhattan",
    name: "Saint Mary Saint Mark Coptic Orthodox Church - Midtown East",
    tradition: "Coptic Orthodox",
    languages: "Mostly English, with some Coptic and Arabic",
    priest: "Abouna Gregory",
    website: "https://www.stmarystmarkmanhattan.com",
    email: "hello@stmarystmarkmanhattan.com",
    phone: "",
    map: "https://maps.app.goo.gl/59fNKYjVXXkpZqA58",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: [
      "Monday Speaker Night: 7:30-9:30 PM",
      "Thursday Bible Study: 7:30-9:30 PM",
      "Saturday Vespers: 7-9 PM",
      "Sunday Divine Liturgy: 8:30-11 AM",
    ],
  },
  {
    borough: "Queens",
    name: "Saint George Coptic Orthodox Church - Astoria",
    tradition: "Coptic Orthodox",
    languages: "English, Coptic, and Arabic",
    priest: "Abouna Yostos, Abouna Sorial",
    website: "https://www.stgeorgeastoria.church",
    email: "contact@stgeorgeastoria.church",
    phone: "929-260-3708",
    map: "https://maps.app.goo.gl/tpR8BuaXA4tixQCv5",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Saturday Vespers: 6-9 PM", "Sunday Divine Liturgy: 6-8:30 AM and 9-11:30 AM"],
  },
  {
    borough: "Queens",
    name: "Saint Mary Saint Antonios Coptic Orthodox Church - Ridgewood",
    tradition: "Coptic Orthodox",
    languages: "Mostly English, with some Coptic and Arabic",
    priest: "Abouna Youhanna, Abouna Antonios, Abouna Eshak, Abouna Jacob",
    website: "https://copticchurch.org/",
    email: "",
    phone: "",
    map: "https://maps.app.goo.gl/2JxLJo3yNSv326tt9",
    transit: "1 minute walk from the D train - Cypress Ave stop",
    services: ["Bible Study on Tuesdays: 7:30-9 PM", "Sunday Divine Liturgy: 8-11 AM"],
  },
];

export const calendarEvents: CalendarEvent[] = [
  { title: "Lidet (Nativity of Our Lord and Savior Jesus Christ)", start: "2026-01-07", end: "2026-01-07" },
  { title: "Ketera (Eve of Epiphany)", start: "2026-01-18", end: "2026-01-18" },
  { title: "Timket (Epiphany)", start: "2026-01-19", end: "2026-01-19" },
  { title: "Cana of Galilee", start: "2026-01-20", end: "2026-01-20" },
  { title: "Fast of Nineveh", start: "2026-02-02", end: "2026-02-04" },
  { title: "Abiy Tsom (Great Lent Fast)", start: "2026-02-18", end: "2026-04-12" },
  { title: "Debre Zeit (Midway marker of Great Lent Fast)", start: "2026-03-15", end: "2026-03-15" },
  { title: "Hosanna (Palm Sunday)", start: "2026-04-05", end: "2026-04-05" },
  { title: "Good Friday", start: "2026-04-10", end: "2026-04-10" },
  { title: "Orthodox Easter", start: "2026-04-12", end: "2026-04-12" },
  { title: "Irget (Ascension of Our Lord and Savior Jesus Christ)", start: "2026-05-21", end: "2026-05-21" },
  { title: "Peraklitos (Pentecost)", start: "2026-05-31", end: "2026-05-31" },
  { title: "Tsome Hawariyat (Fast of the Apostles)", start: "2026-06-01", end: "2026-07-12" },
  { title: "Tsome Filseta (Fast of the Assumption of Our Lady Mary)", start: "2026-08-07", end: "2026-08-22" },
  { title: "Debre Tabor (Transfiguration of Our Lord and Savior Jesus Christ)", start: "2026-08-19", end: "2026-08-19" },
];

export const boroughs = ["All", "Bronx", "Brooklyn", "Manhattan", "Queens"];

export const moments: Moment[] = [
  {
    id: "palm-sunday",
    label: "Palm Sunday | April 5, 2026",
    title: "Hosanna with the OTY NYC community",
    image: "/assets/palm-sunday-community.jpeg",
    alt: "OTY NYC community gathered for Palm Sunday",
    details:
      "A Palm Sunday gathering with OTY NYC, clergy, and friends after worship. This moment captures the fellowship and shared Orthodox life the community is building in New York City.",
  },
  {
    id: "fellowship",
    label: "Fellowship",
    title: "Learning, mentorship, and community life",
    image: "/assets/community-gathering.jpeg",
    alt: "OTY NYC community gathering with clergy and young adults",
    details:
      "A teaching and fellowship gathering for young adults to learn, ask questions, and build relationships across parish communities. These gatherings support both spiritual formation and everyday life in the city.",
  },
];
