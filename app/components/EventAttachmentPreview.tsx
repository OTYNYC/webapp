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

  const href = attachment.fileUrl || attachment.imageSrc;
  const label = imageFailed ? "View image (not public yet)" : attachment.title;

  if (!href) {
    return (
      <span className="attachment-file">
        {attachment.iconLink && <img src={attachment.iconLink} alt="" width="16" height="16" />}
        {label}
      </span>
    );
  }

  return (
    <a className="attachment-file" href={href} target="_blank" rel="noreferrer">
      {attachment.iconLink && <img src={attachment.iconLink} alt="" width="16" height="16" />}
      {label}
    </a>
  );
}
