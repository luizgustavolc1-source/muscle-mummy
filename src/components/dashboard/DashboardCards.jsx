import "./DashboardCards.css";

export default function DashboardCards() {
  const cards = [
    {
      title: "Active Clients",
      value: "28",
      color: "blue",
    },
    {
      title: "Check-ins Today",
      value: "6",
      color: "green",
    },
    {
      title: "Programs Created",
      value: "14",
      color: "purple",
    },
    {
      title: "AI Tasks",
      value: "3",
      color: "orange",
    },
  ];

  return (
    <section className="dashboard-cards">
      {cards.map((card) => (
        <div className={`dashboard-card ${card.color}`} key={card.title}>
          <h3>{card.value}</h3>
          <p>{card.title}</p>
        </div>
      ))}
    </section>
  );
}