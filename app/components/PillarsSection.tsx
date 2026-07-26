import { BookIcon, HeartIcon, UsersIcon } from "./QuickInfoIcons";

const pillars = [
  {
    key: "learning",
    icon: <BookIcon />,
    title: "Learning",
    description:
      "Learning Room sessions that dig into Church history, dogma, canons, and rites many of us never had the chance to study.",
    image: "/assets/pillars/learning.jpg",
  },
  {
    key: "fellowship",
    icon: <UsersIcon />,
    title: "Fellowship",
    description: "Gatherings that build real friendships rooted in shared faith, making NYC feel like home.",
    image: "/assets/pillars/fellowship.jpg",
  },
  {
    key: "service",
    icon: <HeartIcon />,
    title: "Service",
    description: "Hands-on service to our neighbors, putting the Gospel into action beyond the walls of the church.",
    image: "/assets/pillars/service.jpg",
  },
] as const;

export function PillarsSection() {
  return (
    <section className="section pillars-section" id="pillars" aria-labelledby="pillars-title">
      <p className="section-kicker">OUR PILLARS</p>
      <h2 id="pillars-title">
        A faith carried through <span className="text-accent-gold">learn</span>ing, <span className="text-accent-gold">fellow</span>ship and <span className="text-accent-gold">serv</span>ice.
      </h2>
      <div className="pillars-diagram">
        {pillars.map((pillar) => (
          <div className={`pillar pillar-${pillar.key}`} key={pillar.key} tabIndex={0}>
            <div className="pillar-flip">
              <div className="pillar-content">
                <span className="pillar-icon">{pillar.icon}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
              </div>
              <div className="pillar-hover-image">
                <img src={pillar.image} alt="" loading="lazy" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
