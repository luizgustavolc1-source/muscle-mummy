const GOOGLE_SCRIPT = "https://accounts.google.com/gsi/client";
const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events";

function loadGoogleIdentity() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Calendar could not load.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error("Google Calendar could not load."));
    document.head.appendChild(script);
  });
}

export async function connectGoogleCalendar() {
  const clientId = import.meta.env.VITE_GOOGLE_CALENDAR_CLIENT_ID;
  if (!clientId) throw new Error("Google Calendar is not configured yet. Add VITE_GOOGLE_CALENDAR_CLIENT_ID first.");
  await loadGoogleIdentity();

  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: (response) => response.error ? reject(new Error(response.error)) : resolve(response.access_token),
    });
    client.requestAccessToken({ prompt: "consent" });
  });
}

export async function getUpcomingGoogleEvents(accessToken) {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 30);
  const params = new URLSearchParams({
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });
  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Could not load Google Calendar events.");
  return data.items || [];
}
