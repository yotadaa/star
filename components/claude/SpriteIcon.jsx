import React from "react";

const ICON_PATHS = {
  "icon-star-level": (
    <path d="M12 3 L14.3 9.2 L21 9.8 L15.8 14 L17.4 20.6 L12 16.9 L6.6 20.6 L8.2 14 L3 9.8 L9.7 9.2 Z" strokeLinejoin="round" />
  ),
  "icon-level-badge": (
    <>
      <path d="M12 3.5 L19 7.5 V13.2 C19 16.7 16.1 19.2 12 20.8 C7.9 19.2 5 16.7 5 13.2 V7.5 Z" strokeLinejoin="round" />
      <path d="M9 12.2 L11.1 14.3 L15.4 9.8" strokeLinecap="square" />
      <path d="M8 7.8 H16" opacity="0.7" />
    </>
  ),
  "icon-player-points": (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" strokeLinejoin="round" />
      <path d="M9 9 H13.6 C15.1 9 16 9.9 16 11.2 C16 12.6 15.1 13.5 13.6 13.5 H11 V16" strokeLinecap="square" />
      <path d="M9 9 V16" strokeLinecap="square" />
    </>
  ),
  "icon-flame-streak": (
    <>
      <path d="M12 2.5 C12 6 8.5 7 8.5 11 C8.5 13.5 10 14.5 10 14.5 C9 13 9.5 11.5 10.5 10.5 C10.5 13 12.5 13.5 12.5 16 C12.5 17.8 11.2 18.6 11.2 18.6 C14 18.6 17 16.6 17 13 C17 9.5 14 8.5 14 5.5 C14 4 13 3 12 2.5 Z" strokeLinejoin="round" />
      <circle cx="12" cy="19" r="1.6" />
    </>
  ),
  "icon-pin": (
    <>
      <path d="M12 21 C12 21 18 14.6 18 10 C18 6.7 15.3 4 12 4 C8.7 4 6 6.7 6 10 C6 14.6 12 21 12 21 Z" strokeLinejoin="round" />
      <rect x="10.5" y="8.5" width="3" height="3" />
    </>
  ),
  "icon-lock": (
    <>
      <rect x="5.5" y="11" width="13" height="9" />
      <path d="M8.5 11 V8 C8.5 5.5 10 4 12 4 C14 4 15.5 5.5 15.5 8 V11" />
      <rect x="11.2" y="14" width="1.6" height="3.4" fill="currentColor" stroke="none" />
    </>
  ),
  "icon-marker-current": (
    <>
      <rect x="9" y="9" width="6" height="6" fill="currentColor" />
      <rect x="4" y="4" width="16" height="16" opacity="0.5" />
    </>
  ),
  "icon-trophy": (
    <>
      <path d="M7 4 H17 V9 C17 12 14.8 14 12 14 C9.2 14 7 12 7 9 Z" strokeLinejoin="round" />
      <path d="M7 5.5 H4.5 C4.5 8 5.5 9.5 7.5 10" />
      <path d="M17 5.5 H19.5 C19.5 8 18.5 9.5 16.5 10" />
      <line x1="12" y1="14" x2="12" y2="18" />
      <line x1="8.5" y1="20" x2="15.5" y2="20" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </>
  ),
  "icon-clipboard": (
    <>
      <rect x="6" y="5" width="12" height="16" />
      <rect x="9" y="3" width="6" height="3" />
      <line x1="8.5" y1="11" x2="15.5" y2="11" />
      <line x1="8.5" y1="14.5" x2="15.5" y2="14.5" />
    </>
  ),
  "icon-chevron-up": <path d="M6 15 L12 9 L18 15" strokeLinecap="square" />,
  "icon-portal-ring": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" opacity="0.6" />
    </>
  ),
  "icon-compass": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 L13 13 L8.5 15.5 L11 11 Z" strokeLinejoin="round" fill="currentColor" />
    </>
  ),
  "icon-command": (
    <path d="M8.5 5.5 A2.5 2.5 0 1 0 11 8 V16 A2.5 2.5 0 1 0 13.5 18.5 V5.5 A2.5 2.5 0 1 0 16 8 H8 A2.5 2.5 0 1 0 8.5 5.5" strokeLinejoin="round" />
  ),
  "icon-chat-bubble": (
    <>
      <path d="M5 5.5 H19 V15 H12.8 L8 19 V15 H5 Z" strokeLinejoin="round" />
      <path d="M8 9 H16 M8 12 H13" strokeLinecap="square" />
    </>
  ),
  "icon-login-key": (
    <>
      <rect x="4.5" y="5" width="10" height="14" />
      <path d="M8.5 12 H18.5 M16 12 V9.5 M18.5 12 L20.5 10 M18.5 12 L20.5 14" strokeLinecap="square" />
      <path d="M7.5 8.5 H11.5 M7.5 15.5 H10.5" opacity="0.7" />
    </>
  ),
  "icon-user-chip": (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <circle cx="10" cy="11" r="2.2" />
      <path d="M6.8 17 C7.5 15 9 14.2 10 14.2 C11 14.2 12.5 15 13.2 17" strokeLinecap="square" />
      <path d="M14.8 9 H18 M14.8 12 H18 M14.8 15 H17" />
    </>
  ),
  "icon-blog-page": (
    <>
      <path d="M6 4 H15 L19 8 V20 H6 Z" strokeLinejoin="round" />
      <path d="M15 4 V8 H19" strokeLinejoin="round" />
      <path d="M8.5 11 H15.5 M8.5 14.5 H16 M8.5 18 H13" strokeLinecap="square" />
    </>
  ),
  "icon-editor-blocks": (
    <>
      <rect x="4" y="5" width="16" height="4" />
      <rect x="4" y="12" width="7" height="7" />
      <path d="M14 13 H20 M14 16 H18.5 M14 19 H17" strokeLinecap="square" />
    </>
  ),
  "icon-send": (
    <>
      <path d="M4 5 L20 12 L4 19 L7 13 L13 12 L7 11 Z" strokeLinejoin="round" />
      <path d="M7 13 L13 12" strokeLinecap="square" />
    </>
  ),
  "icon-plus": (
    <>
      <path d="M12 5 V19" strokeLinecap="square" />
      <path d="M5 12 H19" strokeLinecap="square" />
    </>
  ),
  "icon-grid": (
    <>
      <rect x="4" y="4" width="6" height="6" />
      <rect x="14" y="4" width="6" height="6" />
      <rect x="4" y="14" width="6" height="6" />
      <rect x="14" y="14" width="6" height="6" />
    </>
  ),
  "icon-list": (
    <>
      <path d="M8 6 H20 M8 12 H20 M8 18 H20" strokeLinecap="square" />
      <path d="M4 6 H4.5 M4 12 H4.5 M4 18 H4.5" strokeLinecap="square" />
    </>
  ),
  "icon-pencil": (
    <>
      <path d="M14.5 4.5 L19.5 9.5 L8 21 H3 V16 Z" strokeLinejoin="round" />
      <path d="M12.5 6.5 L17.5 11.5" strokeLinecap="square" />
    </>
  ),
  "icon-trash": (
    <>
      <path d="M5 7 H19" strokeLinecap="square" />
      <path d="M9 7 V4.5 H15 V7" />
      <path d="M7 7 L8 20 H16 L17 7" strokeLinejoin="round" />
      <path d="M10.5 10.5 V16.5 M13.5 10.5 V16.5" strokeLinecap="square" />
    </>
  ),
  "icon-heading": (
    <>
      <path d="M5 5 V19 M14 5 V19 M5 12 H14" strokeLinecap="square" />
      <path d="M17 9 C17 7.7 18 6.8 19.2 6.8 C20.3 6.8 21 7.5 21 8.4 C21 9.8 17 10.4 17 14 H21" strokeLinejoin="round" />
    </>
  ),
  "icon-quote": (
    <>
      <path d="M5 9 C5 6.8 6.8 5 9 5 V8 C7.9 8 7 8.9 7 10 V13 H10 V18 H5 Z" strokeLinejoin="round" />
      <path d="M14 9 C14 6.8 15.8 5 18 5 V8 C16.9 8 16 8.9 16 10 V13 H19 V18 H14 Z" strokeLinejoin="round" />
    </>
  ),
  "icon-code": (
    <>
      <path d="M9 7 L4 12 L9 17" strokeLinejoin="round" strokeLinecap="square" />
      <path d="M15 7 L20 12 L15 17" strokeLinejoin="round" strokeLinecap="square" />
    </>
  ),
  "icon-image": (
    <>
      <rect x="4" y="5" width="16" height="14" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M5 17 L10 12 L13 15 L16 12 L20 16" strokeLinejoin="round" />
    </>
  ),
  "icon-divider": <path d="M4 12 H20" strokeLinecap="square" strokeDasharray="3 3" />,
  "icon-table": (
    <>
      <rect x="4" y="5" width="16" height="14" />
      <path d="M4 10 H20 M4 14 H20 M10 5 V19 M15 5 V19" strokeLinecap="square" />
    </>
  ),
  "icon-bold": (
    <>
      <path d="M8 5 H13.5 C15.2 5 16.5 6.2 16.5 7.8 C16.5 9.4 15.2 10.6 13.5 10.6 H8 Z" strokeLinejoin="round" />
      <path d="M8 10.6 H14.5 C16.2 10.6 17.5 11.8 17.5 13.8 C17.5 15.8 16.2 17 14.5 17 H8 Z" strokeLinejoin="round" />
    </>
  ),
  "icon-italic": (
    <>
      <path d="M14 5 L10 19" strokeLinecap="square" />
      <path d="M12 5 H17 M7 19 H12" strokeLinecap="square" />
    </>
  ),
  "icon-link": (
    <>
      <path d="M9.5 14.5 L14.5 9.5" strokeLinecap="square" />
      <path d="M11 6.5 L13 4.5 C14.5 3 17 3 18.5 4.5 C20 6 20 8.5 18.5 10 L16.5 12" />
      <path d="M13 17.5 L11 19.5 C9.5 21 7 21 5.5 19.5 C4 18 4 15.5 5.5 14 L7.5 12" />
    </>
  ),
  "icon-database-offline": (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6 V14 C5 15.7 8.1 17 12 17 C15.9 17 19 15.7 19 14 V6" />
      <path d="M5 10 C5 11.7 8.1 13 12 13 C15.9 13 19 11.7 19 10" />
      <path d="M4 20 L20 4" strokeLinecap="square" />
    </>
  ),
  "icon-database-online": (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6 V14 C5 15.7 8.1 17 12 17 C15.9 17 19 15.7 19 14 V6" />
      <path d="M5 10 C5 11.7 8.1 13 12 13 C15.9 13 19 11.7 19 10" />
      <path d="M9 19 L11 21 L16 16" strokeLinecap="square" strokeLinejoin="round" />
    </>
  ),
  "icon-admin-shield": (
    <>
      <path d="M12 3.5 L19 7 V12.5 C19 16.4 16.2 19.2 12 20.8 C7.8 19.2 5 16.4 5 12.5 V7 Z" strokeLinejoin="round" />
      <path d="M8.5 13 H15.5 M12 9 V17" strokeLinecap="square" />
    </>
  ),
  "icon-backpack": (
    <>
      <path d="M8 8 V6.8 C8 4.7 9.7 3.5 12 3.5 C14.3 3.5 16 4.7 16 6.8 V8" />
      <rect x="6" y="7" width="12" height="13" rx="2" />
      <path d="M8.5 12 H15.5 M9 16 H15" />
      <path d="M6 10 H4.7 V17 H6 M18 10 H19.3 V17 H18" />
    </>
  ),
  "icon-scroll": (
    <>
      <path d="M7 5 H17 V18.5 C17 19.6 16.1 20.5 15 20.5 H7.5 C8.4 20.5 9 19.8 9 18.8 V6.8 C9 5.8 8.2 5 7.2 5 C6.2 5 5.5 5.8 5.5 6.8 C5.5 7.7 6.1 8.3 7 8.3 H9" strokeLinejoin="round" />
      <path d="M11 9 H15 M11 12.5 H15 M11 16 H14" />
    </>
  ),
  "icon-tool-wrench": (
    <path d="M14.5 4.5 C16.1 3.9 18 4.2 19.2 5.4 L16.3 8.3 L15.7 10 L17.4 9.4 L20.3 6.5 C21 8.3 20.6 10.4 19.1 11.9 C17.4 13.6 15 13.8 13.1 12.7 L7.1 18.7 C6.4 19.4 5.3 19.4 4.6 18.7 C3.9 18 3.9 16.9 4.6 16.2 L10.6 10.2 C9.6 8.3 9.8 6 11.5 4.5" strokeLinejoin="round" />
  ),
  "icon-artifact-vase": (
    <>
      <path d="M9 4 H15 L14 8 C16 9.2 17 11.4 17 14 C17 18 15 20.5 12 20.5 C9 20.5 7 18 7 14 C7 11.4 8 9.2 10 8 Z" strokeLinejoin="round" />
      <path d="M9 4 H15 M8 13 H16 M9 17 H15" />
    </>
  ),
  "icon-artifact": (
    <>
      <path d="M8 4 H16 L15 8 C16.5 9.5 17 11.3 17 13 C17 16.9 14.8 20 12 20 C9.2 20 7 16.9 7 13 C7 11.3 7.5 9.5 9 8 Z" strokeLinejoin="round" />
      <path d="M8.3 4 H15.7" strokeLinecap="square" />
    </>
  ),
  "icon-medal-outline": (
    <>
      <path d="M9 2 L7 9 L10.5 10.5 L12 5.5 Z" strokeLinejoin="round" />
      <path d="M15 2 L17 9 L13.5 10.5 L12 5.5 Z" strokeLinejoin="round" />
      <circle cx="12" cy="14.5" r="6.2" />
    </>
  ),
  "icon-target": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" opacity="0.75" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  "icon-pixel-face": (
    <>
      <rect x="6" y="4" width="12" height="16" />
      <rect x="9" y="9" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="13" y="9" width="2" height="2" fill="currentColor" stroke="none" />
      <rect x="9" y="14" width="6" height="2" fill="currentColor" stroke="none" />
    </>
  ),
  "icon-key": (
    <>
      <circle cx="8" cy="12" r="3.5" />
      <path d="M11.5 12 H20 M17 12 V15 M14.5 12 V14" />
      <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  "icon-lock-silhouette": (
    <>
      <path d="M7 10 V8 C7 5.2 9 3.5 12 3.5 C15 3.5 17 5.2 17 8 V10 H18.5 V20 H5.5 V10 Z" fill="currentColor" fillOpacity="0.12" strokeLinejoin="round" />
      <path d="M10 10 V8 C10 6.7 10.8 6 12 6 C13.2 6 14 6.7 14 8 V10" />
    </>
  ),
  "icon-route-lost": (
    <>
      <path d="M4 6 H9 L12 9 H20 V18 H15 L12 15 H4 Z" strokeLinejoin="round" />
      <path d="M8 10 L11 13 M11 10 L8 13 M15 12 H18" strokeLinecap="square" />
    </>
  ),
  "icon-forbidden-shield": (
    <>
      <path d="M12 3.5 L19 7 V12.5 C19 16.4 16.2 19.2 12 20.8 C7.8 19.2 5 16.4 5 12.5 V7 Z" strokeLinejoin="round" />
      <path d="M8.5 8.5 L15.5 15.5 M15.5 8.5 L8.5 15.5" strokeLinecap="square" />
    </>
  ),
  "icon-route-redirect": (
    <>
      <path d="M4 7 H15 C17.8 7 20 9.2 20 12 C20 14.8 17.8 17 15 17 H8" />
      <path d="M11 13 L7 17 L11 21 M16 3 L20 7 L16 11" strokeLinecap="square" strokeLinejoin="round" />
    </>
  ),
};

export default function SpriteIcon({ id, className = "", size = 16, title }) {
  const content = ICON_PATHS[id] ?? ICON_PATHS["icon-star-level"];

  return (
    <svg
      className={`sprite-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {content}
    </svg>
  );
}
