import { useEffect, useState } from "react";
import { Bot, RotateCcw, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { askAiSecretary } from "../../services/coachAi";

const welcome = {
  role: "assistant",
  text: "Hi, I’m your Muscle Mummy AI Secretary. I remember this conversation so I can help with client messages, follow-ups, notes and coaching admin.",
};

export default function AiSecretary() {
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [working, setWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadConversation();
  }, []);

  async function loadConversation() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth.user;
    if (!user) return setLoading(false);

    setUserId(user.id);
    const { data, error } = await supabase
      .from("ai_secretary_messages")
      .select("role, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(80);

    if (error) {
      toast.error("AI Secretary memory is not set up yet. Run the SQL setup once.");
    } else if (data?.length) {
      setMessages(data.map((message) => ({ role: message.role, text: message.content })));
    }
    setLoading(false);
  }

  async function saveMessage(message) {
    const { error } = await supabase.from("ai_secretary_messages").insert({
      user_id: userId,
      role: message.role,
      content: message.text,
    });
    if (error) throw error;
  }

  async function send(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || working || !userId) return;

    const nextMessages = [...messages, { role: "user", text }];
    setInput("");
    setWorking(true);

    try {
      await saveMessage(nextMessages.at(-1));
      setMessages(nextMessages);

      const reply = await askAiSecretary(nextMessages);
      const assistantMessage = { role: "assistant", text: reply };
      await saveMessage(assistantMessage);
      setMessages([...nextMessages, assistantMessage]);
    } catch (error) {
      toast.error(error.message || "The AI Secretary could not reply.");
    } finally {
      setWorking(false);
    }
  }

  async function clearConversation() {
    if (!userId || working) return;
    const { error } = await supabase
      .from("ai_secretary_messages")
      .delete()
      .eq("user_id", userId);
    if (error) return toast.error(error.message);
    setMessages([welcome]);
    toast.success("Conversation cleared.");
  }

  return <section className="page secretary-page">
    <div className="page-head">
      <div>
        <h1>AI Secretary</h1>
        <p className="page-sub">Your private assistant with conversation memory.</p>
      </div>
      <button className="secondary secretary-clear" onClick={clearConversation} disabled={working || loading}>
        <RotateCcw size={15} /> Clear conversation
      </button>
    </div>

    <article className="card secretary-card">
      <div className="secretary-heading">
        <span className="secretary-icon"><Bot size={20} /></span>
        <div><b>Muscle Mummy Assistant</b><p>Private coach workspace · memory on</p></div>
      </div>
      <div className="secretary-messages">
        {loading ? <div className="secretary-message assistant"><span>Loading your conversation…</span></div> : messages.map((message, index) => (
          <div className={`secretary-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span></div>
        ))}
        {working && <div className="secretary-message assistant"><span>Thinking…</span></div>}
      </div>
      <form className="secretary-form" onSubmit={send}>
        <textarea rows="3" placeholder="Ask your AI Secretary anything…" value={input} disabled={loading} onChange={(event) => setInput(event.target.value)} />
        <button className="primary" disabled={working || loading || !input.trim()}><Send size={16} /> Send</button>
      </form>
    </article>
  </section>;
}
