"use client";

import { upload } from "@vercel/blob/client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
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
  const [activeUploads, setActiveUploads] = useState(0);
  const [saveTarget, setSaveTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"checking" | "signed-out" | "ready">("checking");
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  const contentRef = useRef<EditableContent | null>(null);

  const contentCount = useMemo(() => {
    if (!content) return "";

    return `${content.featuredEvents.length} featured, ${content.calendarEvents.length} calendar, ${content.moments.length} moments`;
  }, [content]);

  useEffect(() => {
    contentRef.current = content;
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
    const latestContent = contentRef.current;
    if (!latestContent) return;
    if (activeUploads > 0) {
      setMessage("Wait for image uploads to finish before saving.");
      return;
    }

    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(latestContent),
    });
    const payload = (await response.json().catch(() => ({}))) as { content?: EditableContent; message?: string; mode?: string };

    setSaving(false);

    if (!response.ok || !payload.content) {
      setMessage(payload.message || "Content could not be saved.");
      return;
    }

    setContent(payload.content);
    setSaveTarget(payload.mode || saveTarget);
    setMessage(payload.mode === "vercel-blob" ? "Saved to Vercel Blob. The public site will use the update now." : "Saved locally.");
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

  const updateFeaturedEventById = (id: string, patch: Partial<FeaturedEvent>) => {
    setContent((current) => {
      const next = current
        ? {
            ...current,
            featuredEvents: current.featuredEvents.map((event) => (event.id === id ? { ...event, ...patch } : event)),
          }
        : current;

      contentRef.current = next;
      return next;
    });
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

  const updateMomentById = (id: string, patch: Partial<Moment>) => {
    setContent((current) => {
      const next = current
        ? {
            ...current,
            moments: current.moments.map((moment) => (moment.id === id ? { ...moment, ...patch } : moment)),
          }
        : current;

      contentRef.current = next;
      return next;
    });
  };

  const addFeaturedEvent = () => {
    const id = uniqueId("featured-event");

    setContent((current) =>
      current
        ? {
            ...current,
            featuredEvents: [
              ...current.featuredEvents,
              {
                id,
                label: "Featured Event",
                title: "New featured event",
                date: todayInputValue(),
                time: "",
                location: "",
                summary: "Add the event summary.",
                image: "",
                alt: "OTY NYC event image",
                published: true,
              },
            ],
          }
        : current,
    );
    setActiveTab("featured");
    setPendingFocusId(id);
  };

  const addCalendarEvent = () => {
    const id = uniqueId("calendar-event");

    setContent((current) =>
      current
        ? {
            ...current,
            calendarEvents: [
              ...current.calendarEvents,
              {
                id,
                title: "New calendar event",
                start: todayInputValue(),
                end: todayInputValue(),
              },
            ],
          }
        : current,
    );
    setActiveTab("calendar");
    setPendingFocusId(id);
  };

  const addMoment = () => {
    const id = uniqueId("moment");

    setContent((current) =>
      current
        ? {
            ...current,
            moments: [
              ...current.moments,
              {
                id,
                label: "New Moment",
                title: "New community moment",
                image: "",
                alt: "OTY NYC community moment image",
                details: "Add the moment details.",
                published: true,
              },
            ],
          }
        : current,
    );
    setActiveTab("moments");
    setPendingFocusId(id);
  };

  useEffect(() => {
    if (!pendingFocusId) return;

    const card = document.querySelector<HTMLElement>(`[data-card-id="${pendingFocusId}"]`);
    if (!card) return;

    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card
      .querySelector<HTMLInputElement | HTMLTextAreaElement>('input:not([type="checkbox"]):not([type="file"]), textarea')
      ?.focus({ preventScroll: true });
    setPendingFocusId(null);
  }, [pendingFocusId, content]);

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
          <button className="button button-primary" type="button" onClick={save} disabled={saving || activeUploads > 0 || !content}>
            {saving ? "Saving" : activeUploads > 0 ? "Uploading" : "Save changes"}
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
            onAdd={addFeaturedEvent}
          >
            {content.featuredEvents.map((event, index) => (
              <EditorCard
                key={event.id}
                itemId={event.id}
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
                <ImageUpload
                  label="Image"
                  value={event.image}
                  onChange={(value) => updateFeaturedEventById(event.id, { image: value })}
                  onUploadingChange={(uploading) => setActiveUploads((count) => Math.max(0, count + (uploading ? 1 : -1)))}
                />
                <Input label="Alt Text" value={event.alt} onChange={(value) => updateFeaturedEvent(index, { alt: value })} />
              </EditorCard>
            ))}
          </ContentSection>
        )}

        {content && activeTab === "calendar" && (
          <ContentSection
            title="Calendar Events"
            onAdd={addCalendarEvent}
          >
            {content.calendarEvents.map((event, index) => (
              <EditorCard
                key={event.id}
                itemId={event.id}
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
            onAdd={addMoment}
          >
            {content.moments.map((moment, index) => (
              <EditorCard
                key={moment.id}
                itemId={moment.id}
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
                <ImageUpload
                  label="Image"
                  value={moment.image}
                  onChange={(value) => updateMomentById(moment.id, { image: value })}
                  onUploadingChange={(uploading) => setActiveUploads((count) => Math.max(0, count + (uploading ? 1 : -1)))}
                />
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
  itemId,
  onDelete,
  onMoveDown,
  onMoveUp,
  title,
}: {
  children: ReactNode;
  itemId: string;
  onDelete: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  title: string;
}) {
  return (
    <article className="admin-card" data-card-id={itemId}>
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

function ImageUpload({
  label,
  onChange,
  onUploadingChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  onUploadingChange: (uploading: boolean) => void;
  value: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File | undefined) => {
    if (!file) return;
    if (uploading) return;

    const contentType = acceptedImageTypeFor(file);

    if (!contentType) {
      setMessage("Upload a JPG, PNG, WebP, AVIF, or GIF image.");
      return;
    }

    if (file.size > maxUploadBytes) {
      setMessage("Images must be 25 MB or smaller.");
      return;
    }

    setMessage("");
    setProgress(0);
    setUploading(true);
    onUploadingChange(true);

    try {
      const blob = await upload(uploadPathFor(file), file, {
        access: "public",
        contentType,
        handleUploadUrl: "/api/admin/uploads",
        multipart: file.size > multipartThresholdBytes,
        onUploadProgress: (event) => setProgress(event.percentage),
      });

      flushSync(() => onChange(blob.url));
      setMessage("Uploaded directly to Vercel Blob and updated this image field. Save changes to publish it.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message.replace(/^Vercel Blob:\s*/, "") : "Image could not be uploaded.";

      setMessage(errorMessage || "Image could not be uploaded.");
    } finally {
      setUploading(false);
      onUploadingChange(false);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragActive(false);
    void uploadFile(event.dataTransfer.files.item(0) || undefined);
  };

  return (
    <div className="admin-field admin-field-wide">
      <span>{label}</span>
      <label
        className={`admin-upload${dragActive ? " drag-active" : ""}${uploading ? " uploading" : ""}`}
        onDragLeave={() => setDragActive(false)}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {value ? <img src={value} alt="" /> : <div className="admin-upload-placeholder">Image</div>}
        <div className="admin-upload-copy">
          <strong>{uploading ? "Uploading image" : "Drop image here or choose a file"}</strong>
          <small>{uploading ? `${Math.round(progress)}% uploaded` : "JPG, PNG, WebP, AVIF, or GIF. 25 MB max."}</small>
        </div>
        <input
          type="file"
          accept=".avif,.gif,.jpg,.jpeg,.png,.webp,image/avif,image/gif,image/jpeg,image/jpg,image/pjpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => void uploadFile(event.target.files?.item(0) || undefined)}
        />
      </label>
      <input
        className="admin-image-path"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="/assets/uploads/image.jpg"
        aria-label={`${label} path or URL`}
      />
      {message && <p className="admin-upload-message">{message}</p>}
    </div>
  );
}

const maxUploadBytes = 25 * 1024 * 1024;
const multipartThresholdBytes = 4 * 1024 * 1024;
const imageTypesByExtension: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

function uploadPathFor(file: File) {
  const extension = extensionFor(file);
  const name = file.name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);

  return `uploads/${Date.now()}-${name || "upload"}.${extension}`;
}

function extensionFor(file: File) {
  const fileExtension = extensionFromName(file.name);
  const contentType = acceptedImageTypeFor(file);

  if (fileExtension && imageTypesByExtension[fileExtension] === contentType) {
    return fileExtension === "jpeg" ? "jpg" : fileExtension;
  }

  if (contentType === "image/avif") return "avif";
  if (contentType === "image/gif") return "gif";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";

  return "jpg";
}

function acceptedImageTypeFor(file: File) {
  const normalizedType = normalizeImageType(file.type);

  if (normalizedType) return normalizedType;

  const fileExtension = extensionFromName(file.name);

  return fileExtension ? imageTypesByExtension[fileExtension] || "" : "";
}

function normalizeImageType(type: string) {
  if (type === "image/jpg" || type === "image/jpeg" || type === "image/pjpeg") return "image/jpeg";
  if (type === "image/avif" || type === "image/gif" || type === "image/png" || type === "image/webp") return type;

  return "";
}

function extensionFromName(name: string) {
  return name.split(".").pop()?.toLowerCase() || "";
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
  if (target === "vercel-blob") return "Vercel Blob publishing";
  if (target === "local-dev") return "Local saving";

  return "Publishing not configured";
}
