import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <h2>Muscle Mummy</h2>

      <nav>

        <a href="/dashboard">📊 Dashboard</a>

        <a href="/clients">👥 Clients</a>

        <a href="#">🥗 Nutrition</a>

        <a href="#">🏋️ Training</a>

        <a href="#">🤖 AI Assistant</a>

        <a href="/settings">⚙️ Settings</a>

      </nav>

    </aside>
  );
}