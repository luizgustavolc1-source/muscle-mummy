import "./Why.css";

function Why() {
  return (
    <section className="why">
      <div className="why-container">

        <div className="why-header">
          <span className="section-tag">
            WHY MUSCLE MUMMY
          </span>

          <h2>
            Everything a Personal Trainer Needs in One Platform
          </h2>

          <p>
            Stop using spreadsheets, notes and multiple apps.
            Manage your coaching business from one beautiful dashboard.
          </p>
        </div>

        <div className="why-grid">

          <div className="why-card">
            <div className="icon">👥</div>
            <h3>Client Management</h3>
            <p>
              Organize every client with notes, check-ins and progress.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">📈</div>
            <h3>Progress Tracking</h3>
            <p>
              Compare photos, measurements and weekly check-ins.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">🏋️</div>
            <h3>Workout Builder</h3>
            <p>
              Create professional training programs in minutes.
            </p>
          </div>

          <div className="why-card">
            <div className="icon">🥗</div>
            <h3>Nutrition Plans</h3>
            <p>
              Build personalized nutrition plans with ease.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Why;