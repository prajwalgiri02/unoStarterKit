import { useEffect, useRef, useState } from "react";

export interface NotificationItem {
  id: number;
  title: string;
  message?: string | null;
  time: string;
  read?: boolean;
  avatar?: string | null;
}

interface NotificationModalProps {
  onClose: () => void;
  notifications?: NotificationItem[];
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
}

const NotificationModal = ({
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onClearAll,
}: NotificationModalProps) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dropdownOpen) setDropdownOpen(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleMarkAllAsRead = () => {
    setDropdownOpen(false);
    onMarkAllAsRead?.();
  };

  const handleClearAll = () => {
    setDropdownOpen(false);
    onClearAll?.();
  };

  return (
    <>
      {/* Transparent backdrop — catches outside clicks */}
      <div className="fixed inset-0" style={{ zIndex: 150 }} onClick={onClose} aria-hidden="true" />

      {/* Drawer panel */}
      <div
        className="fixed right-4 flex flex-col bg-white"
        style={{
          top: "var(--header-height)",
          width: 380,
          zIndex: 151,
          boxShadow: "-4px 0 24px rgba(0,0,0,0.10)",
          borderLeft: "1px solid #e5e7eb",
          borderRadius: "20px",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notificationPanelLabel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-[#E7E9EC] px-6 py-5">
          <h5 id="notificationPanelLabel" className="title-ex-small text-neutral-900 mb-0">
            Notifications
          </h5>

          {/* More options button + dropdown */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              type="button"
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              onClick={() => setDropdownOpen((prev) => !prev)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 6px",
                color: "#6b7280",
                fontSize: 18,
                lineHeight: 1,
                letterSpacing: 2,
              }}
            >
              •••
            </button>

            {dropdownOpen && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 10,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                  minWidth: 190,
                  zIndex: 10,
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleMarkAllAsRead}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#374151",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Mark all as read
                </button>

                <div style={{ height: 1, background: "#f3f4f6", margin: "0 12px" }} />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleClearAll}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#ef4444",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                  Clear all notifications
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3">
              <img src="/icons/notification1.svg" alt="" width={40} height={40} style={{ opacity: 0.35 }} />
              <p className="body-md text-neutral-500 mb-0">No notifications yet</p>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 px-5 py-4"
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    backgroundColor: n.read ? "#ffffff" : "#eff6ff",
                    cursor: "pointer",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: n.avatar ? "transparent" : "#374151",
                      overflow: "hidden",
                    }}
                  >
                    {n.avatar ? (
                      <img src={n.avatar} alt="" width={40} height={40} style={{ objectFit: "cover" }} />
                    ) : (
                      <img src="/icons/notification1.svg" alt="" width={20} height={20} style={{ filter: "invert(1)" }} />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="body-sm text-neutral-900 mb-0" style={{ fontWeight: 500 }}>
                      {n.title}
                    </p>
                    {n.message && <p className="body-sm text-neutral-500 mb-0">{n.message}</p>}
                  </div>

                  {/* Time + unread indicator */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className="body-xs text-neutral-400" style={{ whiteSpace: "nowrap" }}>
                      {n.time}
                    </span>
                    {!n.read && (
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: "#3b82f6",
                          display: "block",
                        }}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationModal;
