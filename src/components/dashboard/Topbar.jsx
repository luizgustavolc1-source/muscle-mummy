import "./Topbar.css";

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="search">
        <input
          type="text"
          placeholder="Search clients..."
        />
      </div>

      <div className="topbar-right">
        <button className="notification">🔔</button>

        <div className="user">
          <div className="avatar">JM</div>

          <div>
            <strong>Jess</strong>
            <p>Personal Trainer</p>
          </div>
        </div>
      </div>
    </header>
  );
}