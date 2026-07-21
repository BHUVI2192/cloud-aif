"use client";

interface ProviderContactActionGroupProps {
  providerId: string;
  phone: string;
  displayName: string;
  requestTitle: string;
  requestId?: string;
}

export default function ProviderContactActionGroup({
  providerId,
  phone,
  displayName,
  requestTitle,
  requestId,
}: ProviderContactActionGroupProps) {
  const trackContact = (channel: "PHONE" | "WHATSAPP") => {
    fetch("/api/attribution", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "LEAD_CONTACT_REVEAL",
        providerId,
        requestId,
        channel,
        source: "REQUEST_DETAIL",
      }),
    }).catch(() => {
      // Non-blocking attribution ping
    });
  };

  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const waUrl = `https://wa.me/91${cleanPhone}?text=Hi%20${encodeURIComponent(
    displayName
  )},%20I'm%20contacting%20you%20from%20Cloud%20AIF%20regarding%20my%20service%20request%20"${encodeURIComponent(
    requestTitle
  )}".`;

  return (
    <div className="mt-4 space-y-2">
      <a
        href={`tel:${phone}`}
        onClick={() => trackContact("PHONE")}
        className="btn btn-primary text-[14px] w-full text-center"
        style={{ display: "block", background: "#16a34a" }}
      >
        📞 Call Your Provider
      </a>
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackContact("WHATSAPP")}
        className="btn btn-secondary text-[14px] w-full text-center transition"
        style={{
          display: "block",
          color: "#25D366",
          borderColor: "#25D366",
          background: "transparent",
          fontWeight: 600,
        }}
      >
        💬 Message on WhatsApp
      </a>
    </div>
  );
}
