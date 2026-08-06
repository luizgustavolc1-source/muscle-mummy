import { useEffect, useState } from "react";
import { ArrowLeft, ImagePlus, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { generateCoachDraft } from "../../services/coachAi";

const nutritionOptions = ["Maintain calories", "Increase calories", "Reduce calories", "Increase protein", "Reduce protein", "Increase carbohydrates", "Reduce carbohydrates"];
const workoutOptions = ["Increase training intensity", "Reduce training intensity", "Increase training volume", "Focus on a specific muscle group", "Prioritise strength", "Prioritise fat loss"];

export default function Client() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState("overview");
  const [checkins, setCheckins] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [plans, setPlans] = useState([]);
  const [draft, setDraft] = useState("");
  const [draftType, setDraftType] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);
  const [workoutAdjustments, setWorkoutAdjustments] = useState([]);
  const [nutritionAdjustments, setNutritionAdjustments] = useState([]);
  const [muscleFocus, setMuscleFocus] = useState("");

  async function load() {
    const { data } = await supabase.from("clients").select("*").eq("id", id).single();
    setClient(data);
    const [checks, images, savedPlans] = await Promise.all([
      supabase.from("checkins").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("client_photos").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("ai_client_plans").select("*").eq("client_id", id).order("created_at", { ascending: false }).limit(8),
    ]);
    if (!checks.error) setCheckins(checks.data || []);
    if (!images.error) setPhotos(images.data || []);
    if (!savedPlans.error) setPlans(savedPlans.data || []);
  }

  useEffect(() => { load(); }, [id]);

  function toggleOption(option, setter) {
    setter((current) => current.includes(option) ? current.filter((item) => item !== option) : [...current, option]);
  }

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
    const selected = type === "workout" ? workoutAdjustments : nutritionAdjustments;
    const adjustments = muscleFocus && type === "workout" ? [...selected, `Target muscle group: ${muscleFocus}`] : selected;
    setGenerating(true);
    setDraft("");
    try {
      const text = await generateCoachDraft(type, id, adjustments);
      setDraft(text);
      setDraftType(type);
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("ai_client_plans").insert({
        client_id: id,
        user_id: auth.user?.id,
        plan_type: type,
        adjustments,
        content: text,
      });
      if (error) toast.warning("Draft created, but its history could not be saved yet.");
      else { toast.success("Draft generated and saved to history"); load(); }
    } catch (error) {
      toast.error(error.message || "The AI generator could not create a draft.");
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
    {tab === "plans" && <div className="stack">
      <article className="card profile-card"><h2>Workout generator</h2><p className="page-sub">Uses this client’s profile, check-ins and saved workout history.</p><div className="option-grid">{workoutOptions.map(option => <button key={option} className={`option-button ${workoutAdjustments.includes(option) ? "selected" : ""}`} onClick={() => toggleOption(option, setWorkoutAdjustments)}>{option}</button>)}</div>{workoutAdjustments.includes("Focus on a specific muscle group") && <label className="field plan-focus">Muscle group<select value={muscleFocus} onChange={(event) => setMuscleFocus(event.target.value)}><option value="">Select a muscle group</option><option>Glutes</option><option>Hamstrings</option><option>Quadriceps</option><option>Back</option><option>Chest</option><option>Shoulders</option><option>Arms</option><option>Core</option></select></label>}<div className="actions"><button className="primary" disabled={generating} onClick={() => generate("workout")}><Sparkles size={16} /> {generating ? "Generating…" : "Generate workout"}</button></div></article>
      <article className="card profile-card"><h2>Nutrition generator</h2><p className="page-sub">Adjust calories and macros while keeping the client’s past plans in context.</p><div className="option-grid">{nutritionOptions.map(option => <button key={option} className={`option-button ${nutritionAdjustments.includes(option) ? "selected" : ""}`} onClick={() => toggleOption(option, setNutritionAdjustments)}>{option}</button>)}</div><div className="actions"><button className="primary" disabled={generating} onClick={() => generate("nutrition")}><Sparkles size={16} /> {generating ? "Generating…" : "Generate nutrition"}</button></div></article>
      {draft && <article className="card profile-card"><h2>{draftType === "workout" ? "Workout" : "Nutrition"} draft</h2><pre className="generator">{draft}</pre></article>}
      <article className="card profile-card"><h2>Plan history</h2><div className="stack">{plans.length ? plans.map(plan => <div className="checkin" key={plan.id}><b>{plan.plan_type === "workout" ? "Workout" : "Nutrition"} · {new Date(plan.created_at).toLocaleDateString("en-AU")}</b><p>{Array.isArray(plan.adjustments) && plan.adjustments.length ? plan.adjustments.join(" · ") : "No adjustments selected"}</p></div>) : <p>Generated plans will appear here.</p>}</div></article>
    </div>}
  </section>;
}
