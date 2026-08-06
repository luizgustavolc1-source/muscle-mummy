import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { toast } from "sonner";
import { askAiSecretary } from "../../services/coachAi";

const welcome = { role: "assistant", text: "Hi, I’m your Muscle Mummy AI Secretary. Ask me to draft client messages, organise your priorities, create follow-up notes, or help with your coaching admin." };

export default function AiSecretary() {
  const [messages, setMessages] = useState([welcome]);
  const [input, setInput] = useState("");
  const [working, setWorking] = useState(false);

  async function send(event) {
    event.preventDefault();
    const text = input.trim();
    if (!text || working) return;
    const nextMessages = [...messages, { role: "user", text }];
    setMessages(nextMessages);
    setInput("");
    setWorking(true);
    try {
      const reply = await askAiSecretary(nextMessages);
      setMessages([...nextMessages, { role: "assistant", text: reply }]);
    } catch (error) {
      toast.error(error.message || "The AI Secretary could not reply.");
    } finally {
      setWorking(false);
    }
  }

  return <section className="page secretary-page">
    <div className="page-head"><div><h1>AI Secretary</h1><p className="page-sub">Your private assistant for coaching administration and client communication.</p></div></div>
    <article className="card secretary-card">
      <div className="secretary-heading"><span className="secretary-icon"><Bot size={20} /></span><div><b>Muscle Mummy Assistant</b><p>Private coach workspace</p></div></div>
      <div className="secretary-messages">
        {messages.map((message, index) => <div className={`secretary-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.text}</span></div>)}
        {working && <div className="secretary-message assistant"><span>Thinking…</span></div>}
      </div>
      <form className="secretary-form" onSubmit={send}>
        <textarea rows="3" placeholder="Ask your AI Secretary anything…" value={input} onChange={(event) => setInput(event.target.value)} />
        <button className="primary" disabled={working || !input.trim()}><Send size={16} /> Send</button>
      </form>
    </article>
  </section>;
}
