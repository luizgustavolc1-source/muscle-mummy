import { useState } from "react";
import { CalendarDays, Link2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { connectGoogleCalendar, getUpcomingGoogleEvents } from "../../services/googleCalendar";

function eventTime(event) {
  const start = event.start?.dateTime || event.start?.date;
  if (!start) return "No date";
  const date = new Date(start);
  const allDay = !event.start?.dateTime;
  return allDay
    ? date.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })
    : date.toLocaleString("en-AU", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export default function Calendar() {
  const [accessToken, setAccessToken] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadEvents(token = accessToken) {
    if (!token) return;
    setLoading(true);
    try {
      setEvents(await getUpcomingGoogleEvents(token));
      toast.success("Google Calendar updated");
    } catch (error) {
      toast.error(error.message || "Could not update Google Calendar.");
    } finally { setLoading(false); }
  }

  async function connect() {
    setLoading(true);
    try {
      const token = await connectGoogleCalendar();
      setAccessToken(token);
      await loadEvents(token);
    } catch (error) {
      toast.error(error.message || "Google Calendar connection failed.");
    } finally { setLoading(false); }
  }

  return <section className="page calendar-page">
    <div className="page-head">
      <div><h1>Calendar</h1><p className="page-sub">View your coaching schedule from Google Calendar.</p></div>
      {accessToken ? <button className="secondary calendar-action" onClick={() => loadEvents()} disabled={loading}><RefreshCw size={16} /> Refresh</button> : <button className="primary calendar-action" onClick={connect} disabled={loading}><Link2 size={16} /> {loading ? "Connecting…" : "Connect Google Calendar"}</button>}
    </div>

    {!accessToken ? <article className="card calendar-empty"><span className="calendar-icon"><CalendarDays size={26} /></span><h2>Connect your Google Calendar</h2><p>Use the same Google Calendar account that is visible in the Calendar app on the iPhone. Your upcoming coaching events will appear here.</p><button className="primary calendar-action" onClick={connect} disabled={loading}><Link2 size={16} /> Connect Google Calendar</button></article> : <article className="card calendar-list"><div className="calendar-list-head"><div><h2>Upcoming events</h2><p>Next 30 days · Google Calendar</p></div><span className="badge">Connected</span></div>{events.length ? <div className="calendar-events">{events.map((event) => <div className="calendar-event" key={event.id}><div className="calendar-date">{eventTime(event)}</div><div><b>{event.summary || "Untitled event"}</b>{event.location && <p>{event.location}</p>}</div></div>)}</div> : <div className="empty">No upcoming events in the next 30 days.</div>}</article>}
  </section>;
}
