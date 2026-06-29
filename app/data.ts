import calendarEventsJson from "../content/calendar-events.json";
import churchesJson from "../content/churches.json";
import featuredEventsJson from "../content/featured-events.json";
import momentsJson from "../content/moments.json";

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
  id: string;
  title: string;
  start: string;
  end: string;
}

export interface FeaturedEvent {
  id: string;
  label: string;
  title: string;
  date: string;
  time: string;
  location: string;
  summary: string;
  image: string;
  alt: string;
  published: boolean;
}

export interface Moment {
  id: string;
  label: string;
  title: string;
  image: string;
  alt: string;
  details: string;
  published: boolean;
}

export const churches = churchesJson satisfies Church[];

export const calendarEvents = calendarEventsJson satisfies CalendarEvent[];

export const featuredEvents = featuredEventsJson satisfies FeaturedEvent[];

export const moments = momentsJson satisfies Moment[];

export const boroughs = ["All", "Bronx", "Brooklyn", "Manhattan", "Queens"];
