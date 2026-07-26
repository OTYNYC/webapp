"use client";

import { useState } from "react";
import type { CalendarAttachment } from "../lib/googleCalendar";

export function EventAttachmentPreview({ attachment }: { attachment: CalendarAttachment }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (attachment.imageSrc && !imageFailed) {
    return (
      <a className="attachment-image" href={attachment.fileUrl || attachment.imageSrc} target="_blank" rel="noreferrer">
        <img src={attachment.imageSrc} alt={attachment.title} loading="lazy" onError={() => setImageFailed(true)} />
      </a>
    );
  }

  return (
    <a className="attachment-file" href={attachment.fileUrl} target="_blank" rel="noreferrer">
      {attachment.iconLink && <img src={attachment.iconLink} alt="" width="16" height="16" />}
      {imageFailed ? "View image (not public yet)" : attachment.title}
    </a>
  );
}
