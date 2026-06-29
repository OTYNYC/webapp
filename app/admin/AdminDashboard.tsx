"use client";

import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import type { CalendarEvent, FeaturedEvent, Moment } from "../data";

interface EditableContent {
  featuredEvents: FeaturedEvent[];
  calendarEvents: CalendarEvent[];
  moments: Moment[];
}

type AdminTab = "featured" | "calendar" | "moments";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "featured", label: "Featured" },
  { id: "calendar", label: "Calendar" },
  { id: "moments", label: "Moments" },
];

export function AdminDashboard() {
  const [content, setContent] = useState<EditableContent | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>("featured");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saveTarget, setSaveTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"checking" | "signed-out" | "ready">("checking");

  const contentCount = useMemo(() => {
    if (!content) return "";

    return `${content.featuredEvents.length} featured, ${content.calendarEvents.length} calendar, ${content.moments.length} moments`;
  }, [content]);

  const loadContent = useCallback(async () => {
    setStatus("checking");
    setMessage("");

    const response = await fetch("/api/admin/content", { cache: "no-store" });

    if (response.status === 401) {
      setStatus("signed-out");
      setContent(null);
      return;
    }

    if (!response.ok) {
      setStatus("signed-out");
      setMessage("Admin content could not be loaded.");
      return;
    }

    const payload = (await response.json()) as { content: EditableContent; saveTarget: string };

    setContent(payload.content);
    setSaveTarget(payload.saveTarget);
    setStatus("ready");
  }, []);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, username }),
    });
    const payload = (await response.json().catch(() => ({}))) as { message?: string };

    if (!response.ok) {
      setMessage(payload.message || "Sign-in failed.");
      return;
    }

    setPassword("");
    await loadContent();
  };

  const signOut = async () => {
    await fetch("/api/admin/session", { method: "DELETE" });
    setContent(null);
    setStatus("signed-out");
    setMessage("Signed out.");
  };

  const save = async () => {
    if (!content) return;

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    });
    const payload = (await response.json().catch(() => ({}))) as { content?: EditableContent; message?: string; mode?: string };

    setSaving(false);

    if (!response.ok || !payload.content) {
      setMessage(payload.message || "Content could not be saved.");
      return;
    }

    setContent(payload.content);
    setSaveTarget(payload.mode || saveTarget);
    setMessage(payload.mode === "github" ? "Saved to GitHub. Deployment will start from the new commit." : "Saved locally.");
  };

  const updateFeaturedEvent = (index: number, patch: Partial<FeaturedEvent>) => {
    setContent((current) =>
      current
        ? {
            ...current,
            featuredEvents: updateItem(current.featuredEvents, index, patch),
          }
        : current,
    );
  };

  const updateCalendarEvent = (index: number, patch: Partial<CalendarEvent>) => {
    setContent((current) =>
      current
        ? {
            ...current,
            calendarEvents: updateItem(current.calendarEvents, index, patch),
          }
        : current,
    );
  };

  const updateMoment = (index: number, patch: Partial<Moment>) => {
    setContent((current) =>
      current
        ? {
            ...current,
            moments: updateItem(current.moments, index, patch),
          }
        : current,
    );
  };

  if (status === "checking") {
    return (
      <main className="subpage-main admin-main" id="main">
        <section className="admin-panel">
          <p className="section-kicker">Admin</p>
          <h1>Loading content.</h1>
        </section>
      </main>
    );
  }

  if (status === "signed-out") {
    return (
      <main className="subpage-main admin-main" id="main">
        <section className="admin-login" aria-labelledby="admin-login-title">
          <div>
            <p className="section-kicker">Admin</p>
            <h1 id="admin-login-title">Sign in.</h1>
          </div>
          <form onSubmit={signIn}>
            <label className="admin-field">
              <span>Username</span>
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
            </label>
            <label className="admin-field">
              <span>Password</span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            <button className="button button-primary" type="submit">
              Sign in
            </button>
            {message && <p className="admin-message">{message}</p>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="subpage-main admin-main" id="main">
      <section className="admin-hero" aria-labelledby="admin-title">
        <div>
          <p className="section-kicker">Admin</p>
          <h1 id="admin-title">Content dashboard.</h1>
          <p>{contentCount}</p>
        </div>
        <div className="admin-hero-actions">
          <span>{saveTargetLabel(saveTarget)}</span>
          <button className="button button-primary" type="button" onClick={save} disabled={saving || !content}>
            {saving ? "Saving" : "Save changes"}
          </button>
          <button className="button button-secondary on-light" type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </section>

      {message && <p className="admin-message admin-message-wide">{message}</p>}

      <section className="admin-shell" aria-label="Admin editor">
        <div className="admin-tabs" role="tablist" aria-label="Content sections">
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.id ? "active" : undefined}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {content && activeTab === "featured" && (
          <ContentSection
            title="Featured Events"
            onAdd={() =>
              setContent((current) =>
                current
                  ? {
                      ...current,
                      featuredEvents: [
                        ...current.featuredEvents,
                        {
                          id: uniqueId("featured-event"),
                          label: "Featured Event",
                          title: "New featured event",
                          date: todayInputValue(),
                          time: "",
                          location: "",
                          summary: "Add the event summary.",
                          image: "/assets/community-gathering.jpeg",
                          alt: "OTY NYC community gathering",
                          published: true,
                        },
                      ],
                    }
                  : current,
              )
            }
          >
            {content.featuredEvents.map((event, index) => (
              <EditorCard
                key={event.id}
                title={event.title}
                onDelete={() =>
                  setContent((current) =>
                    current ? { ...current, featuredEvents: removeItem(current.featuredEvents, index) } : current,
                  )
                }
                onMoveDown={() =>
                  setContent((current) =>
                    current ? { ...current, featuredEvents: moveItem(current.featuredEvents, index, 1) } : current,
                  )
                }
                onMoveUp={() =>
                  setContent((current) =>
                    current ? { ...current, featuredEvents: moveItem(current.featuredEvents, index, -1) } : current,
                  )
                }
              >
                <label className="admin-check">
                  <input checked={event.published} type="checkbox" onChange={(input) => updateFeaturedEvent(index, { published: input.target.checked })} />
                  <span>Published</span>
                </label>
                <Input label="ID" value={event.id} onChange={(value) => updateFeaturedEvent(index, { id: slugify(value) })} />
                <Input label="Label" value={event.label} onChange={(value) => updateFeaturedEvent(index, { label: value })} />
                <Input label="Title" value={event.title} onChange={(value) => updateFeaturedEvent(index, { title: value })} />
                <Input label="Date" value={event.date} type="date" onChange={(value) => updateFeaturedEvent(index, { date: value })} />
                <Input label="Time" value={event.time} onChange={(value) => updateFeaturedEvent(index, { time: value })} />
                <Input label="Location" value={event.location} onChange={(value) => updateFeaturedEvent(index, { location: value })} />
                <TextArea label="Summary" value={event.summary} onChange={(value) => updateFeaturedEvent(index, { summary: value })} />
                <Input label="Image" value={event.image} onChange={(value) => updateFeaturedEvent(index, { image: value })} />
                <Input label="Alt Text" value={event.alt} onChange={(value) => updateFeaturedEvent(index, { alt: value })} />
              </EditorCard>
            ))}
          </ContentSection>
        )}

        {content && activeTab === "calendar" && (
          <ContentSection
            title="Calendar Events"
            onAdd={() =>
              setContent((current) =>
                current
                  ? {
                      ...current,
                      calendarEvents: [
                        ...current.calendarEvents,
                        {
                          id: uniqueId("calendar-event"),
                          title: "New calendar event",
                          start: todayInputValue(),
                          end: todayInputValue(),
                        },
                      ],
                    }
                  : current,
              )
            }
          >
            {content.calendarEvents.map((event, index) => (
              <EditorCard
                key={event.id}
                title={event.title}
                onDelete={() =>
                  setContent((current) => (current ? { ...current, calendarEvents: removeItem(current.calendarEvents, index) } : current))
                }
                onMoveDown={() =>
                  setContent((current) => (current ? { ...current, calendarEvents: moveItem(current.calendarEvents, index, 1) } : current))
                }
                onMoveUp={() =>
                  setContent((current) => (current ? { ...current, calendarEvents: moveItem(current.calendarEvents, index, -1) } : current))
                }
              >
                <Input label="ID" value={event.id} onChange={(value) => updateCalendarEvent(index, { id: slugify(value) })} />
                <Input label="Title" value={event.title} onChange={(value) => updateCalendarEvent(index, { title: value })} />
                <Input label="Start" value={event.start} type="date" onChange={(value) => updateCalendarEvent(index, { start: value })} />
                <Input label="End" value={event.end} type="date" onChange={(value) => updateCalendarEvent(index, { end: value })} />
              </EditorCard>
            ))}
          </ContentSection>
        )}

        {content && activeTab === "moments" && (
          <ContentSection
            title="Community Moments"
            onAdd={() =>
              setContent((current) =>
                current
                  ? {
                      ...current,
                      moments: [
                        ...current.moments,
                        {
                          id: uniqueId("moment"),
                          label: "New Moment",
                          title: "New community moment",
                          image: "/assets/community-gathering.jpeg",
                          alt: "OTY NYC community gathering",
                          details: "Add the moment details.",
                          published: true,
                        },
                      ],
                    }
                  : current,
              )
            }
          >
            {content.moments.map((moment, index) => (
              <EditorCard
                key={moment.id}
                title={moment.title}
                onDelete={() => setContent((current) => (current ? { ...current, moments: removeItem(current.moments, index) } : current))}
                onMoveDown={() => setContent((current) => (current ? { ...current, moments: moveItem(current.moments, index, 1) } : current))}
                onMoveUp={() => setContent((current) => (current ? { ...current, moments: moveItem(current.moments, index, -1) } : current))}
              >
                <label className="admin-check">
                  <input checked={moment.published} type="checkbox" onChange={(input) => updateMoment(index, { published: input.target.checked })} />
                  <span>Published</span>
                </label>
                <Input label="ID" value={moment.id} onChange={(value) => updateMoment(index, { id: slugify(value) })} />
                <Input label="Label" value={moment.label} onChange={(value) => updateMoment(index, { label: value })} />
                <Input label="Title" value={moment.title} onChange={(value) => updateMoment(index, { title: value })} />
                <Input label="Image" value={moment.image} onChange={(value) => updateMoment(index, { image: value })} />
                <Input label="Alt Text" value={moment.alt} onChange={(value) => updateMoment(index, { alt: value })} />
                <TextArea label="Details" value={moment.details} onChange={(value) => updateMoment(index, { details: value })} />
              </EditorCard>
            ))}
          </ContentSection>
        )}
      </section>
    </main>
  );
}

function ContentSection({ children, onAdd, title }: { children: ReactNode; onAdd: () => void; title: string }) {
  return (
    <div className="admin-section">
      <div className="admin-section-heading">
        <h2>{title}</h2>
        <button className="button button-primary" type="button" onClick={onAdd}>
          Add
        </button>
      </div>
      <div className="admin-grid">{children}</div>
    </div>
  );
}

function EditorCard({
  children,
  onDelete,
  onMoveDown,
  onMoveUp,
  title,
}: {
  children: ReactNode;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  title: string;
}) {
  return (
    <article className="admin-card">
      <header>
        <h3>{title}</h3>
        <div>
          <button type="button" onClick={onMoveUp} aria-label={`Move ${title} up`}>
            Up
          </button>
          <button type="button" onClick={onMoveDown} aria-label={`Move ${title} down`}>
            Down
          </button>
          <button type="button" onClick={onDelete} aria-label={`Delete ${title}`}>
            Delete
          </button>
        </div>
      </header>
      <div className="admin-fields">{children}</div>
    </article>
  );
}

function Input({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="admin-field admin-field-wide">
      <span>{label}</span>
      <textarea value={value} rows={4} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)} />
    </label>
  );
}

function updateItem<T>(items: T[], index: number, patch: Partial<T>) {
  return items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item));
}

function removeItem<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;

  const nextItems = [...items];
  const [item] = nextItems.splice(index, 1);
  nextItems.splice(targetIndex, 0, item);

  return nextItems;
}

function uniqueId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || uniqueId("item")
  );
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function saveTargetLabel(target: string) {
  if (target === "github") return "GitHub publishing";
  if (target === "local-dev") return "Local saving";

  return "Publishing not configured";
}
