import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          AI that helps personal trainers coach smarter.
        </h1>

        <p>
          Manage clients, generate training plans, create nutrition drafts and
          save hours every week.
        </p>

        <div className="hero-buttons">
          <button className="primary">Start Free Trial</button>
          <button className="secondary">Watch Demo</button>
        </div>
      </div>
    </section>
  );
}