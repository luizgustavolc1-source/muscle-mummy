import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { generateCoachDraft } from "../../services/coachAi";

const fallbackWorkout = (client) => `WORKOUT DRAFT\n\nClient: ${client.full_name}\nGoal: ${client.goal || "General fitness"}\n\nDay 1 — Lower body\n• Squat — 3 × 8–10\n• Romanian deadlift — 3 × 10\n• Split squat — 3 × 10 each side\n\nDay 2 — Upper body\n• Dumbbell press — 3 × 8–10\n• Lat pulldown — 3 × 10\n• Seated row — 3 × 10\n\nReview and personalise before sharing.`;
const fallbackNutrition = (client) => `NUTRITION DRAFT\n\nClient: ${client.full_name}\nGoal: ${client.goal || "General fitness"}\n\nBuild meals around a lean protein source, fruit or vegetables, high-fibre carbohydrates and healthy fats.\n\nSuggested structure\n• Breakfast: protein + fibre\n• Lunch: protein + vegetables + carbohydrate\n• Dinner: protein + vegetables + carbohydrate\n• Snacks: yoghurt, fruit, nuts or a protein option\n\nConfirm allergies, preferences, calorie targets and portions before sharing.`;

export default function Client() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState("overview");
  const [checkins, setCheckins] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [draft, setDraft] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  async function load() {
    const { data } = await supabase.from("clients").select("*").eq("id", id).single();
    setClient(data);
    const checks = await supabase.from("checkins").select("*").eq("client_id", id).order("created_at", { ascending: false });
    if (!checks.error) setCheckins(checks.data || []);
    const images = await supabase.from("client_photos").select("*").eq("client_id", id).order("created_at", { ascending: false });
    if (!images.error) setPhotos(images.data || []);
  }

  useEffect(() => { load(); }, [id]);

  async function saveCheckin(event) {
    event.preventDefault();
    const { error } = await supabase.from("checkins").insert({ client_id: id, weight: weight ? Number(weight) : null, notes });
    if (error) return toast.error(error.message);
    setWeight(""); setNotes(""); toast.success("Check-in saved"); load();
  }

  async function addPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Choose a photo smaller than 2 MB");
    const reader = new FileReader();
    reader.onload = async () => {
      const { error } = await supabase.from("client_photos").insert({ client_id: id, photo_url: reader.result });
      if (error) return toast.error(error.message);
      toast.success("Photo uploaded"); load();
    };
    reader.readAsDataURL(file);
  }

  async function generate(type) {
    setGenerating(true);
    try {
      setDraft(await generateCoachDraft(type, client));
      toast.success("Draft generated");
    } catch {
      setDraft(type === "workout" ? fallbackWorkout(client) : fallbackNutrition(client));
      toast.info("AI is not connected yet — showing a coaching draft instead.");
    } finally { setGenerating(false); }
  }

  if (!client) return <section className="page">Loading client…</section>;
  return <section className="page">
    <Link className="back-link" to="/clients"><ArrowLeft size={16} /> Back to clients</Link>
    <div className="page-head"><div><h1>{client.full_name}</h1><p className="page-sub">{client.goal || "No goal set"} · {client.email || "No email"}</p></div><span className="badge">{client.status || "Active"}</span></div>
    <div className="tabs">{["overview", "check-ins", "photos", "plans"].map(item => <button key={item} className={`tab ${tab === item ? "active" : ""}`} onClick={() => setTab(item)}>{item}</button>)}</div>
    {tab === "overview" && <div className="profile-grid"><article className="card profile-card"><h2>Client details</h2><div className="detail-list"><div><span>Email</span><b>{client.email || "—"}</b></div><div><span>Phone</span><b>{client.phone || "—"}</b></div><div><span>Height</span><b>{client.height ? `${client.height} cm` : "—"}</b></div><div><span>Starting weight</span><b>{client.weight ? `${client.weight} kg` : "—"}</b></div></div></article><article className="card profile-card"><h2>Coach notes</h2><p>{client.coach_notes || "No notes yet."}</p></article></div>}
    {tab === "check-ins" && <div className="profile-grid"><form className="card profile-card" onSubmit={saveCheckin}><h2>New check-in</h2><div className="stack"><label className="field">Weight (kg)<input type="number" step="0.1" value={weight} onChange={event => setWeight(event.target.value)} /></label><label className="field">Notes<textarea rows="4" placeholder="Training, sleep, hunger, adherence…" value={notes} onChange={event => setNotes(event.target.value)} /></label><button className="primary">Save check-in</button></div></form><article className="card profile-card"><h2>History</h2><div className="stack">{checkins.length ? checkins.map(item => <div className="checkin" key={item.id}><b>{item.weight ? `${item.weight} kg` : "Check-in"}</b><p>{item.notes || "No notes"}</p><small>{new Date(item.created_at).toLocaleDateString("en-AU")}</small></div>) : <p>No check-ins yet.</p>}</div></article></div>}
    {tab === "photos" && <article className="card profile-card"><h2>Progress photos</h2><label className="upload"><ImagePlus size={18} /><input type="file" accept="image/*" onChange={addPhoto} />Upload photo</label><div className="photo-grid">{photos.length ? photos.map(photo => <img key={photo.id} src={photo.photo_url} alt="Client progress" />) : <p>No photos uploaded.</p>}</div></article>}
    {tab === "plans" && <article className="card profile-card"><h2>Coaching drafts</h2><p className="page-sub">Generate a private draft, then review and personalise it before sharing.</p><div className="actions"><button className="primary" disabled={generating} onClick={() => generate("workout")}><Sparkles size={16} /> {generating ? "Generating…" : "Generate workout"}</button><button className="secondary" disabled={generating} onClick={() => generate("nutrition")}>{generating ? "Generating…" : "Generate nutrition"}</button></div>{draft && <pre className="generator">{draft}</pre>}</article>}
  </section>;
}
