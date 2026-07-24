import "./DashboardPreview.css";

export default function DashboardPreview() {
  return (
    <section className="dashboard-preview">

      <h2>Everything in one dashboard.</h2>

      <p>
        Manage clients, check-ins, nutrition plans and training programs
        from one simple interface.
      </p>

      <div className="dashboard-card">

        <div className="sidebar">
          <div>Dashboard</div>
          <div>Clients</div>
          <div>Nutrition</div>
          <div>Training</div>
          <div>Settings</div>
        </div>

        <div className="content">

          <div className="top-cards">

            <div className="card">
              <h3>128</h3>
              <span>Active Clients</span>
            </div>

            <div className="card">
              <h3>24</h3>
              <span>Check-ins Today</span>
            </div>

            <div className="card">
              <h3>92%</h3>
              <span>Program Completion</span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}