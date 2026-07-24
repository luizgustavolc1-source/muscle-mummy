import "./DashboardPreviewV2.css";

function DashboardPreviewV2() {
  return (
    <div className="dashboard-v2">

      <div className="dashboard-header">
        <h3>Muscle Mummy</h3>

        <span className="status">
          ● Live
        </span>
      </div>

      <div className="stats">

        <div className="stat-card">
          <span className="label">
            Active Clients
          </span>

          <h2>128</h2>

          <small>+12 this month</small>
        </div>

        <div className="stat-card">
          <span className="label">
            Weekly Check-ins
          </span>

          <h2>42</h2>

          <small>94% completed</small>
        </div>

      </div>

      <div className="activity">

        <h4>Today's Activity</h4>

        <ul>

          <li>Emma uploaded progress photos</li>

          <li>James completed workout</li>

          <li>Sarah submitted check-in</li>

          <li>AI generated nutrition update</li>

        </ul>

      </div>

    </div>
  );
}

export default DashboardPreviewV2;