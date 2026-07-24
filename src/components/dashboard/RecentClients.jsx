import "./RecentClients.css";

const clients = [
  {
    name: "Sarah Johnson",
    goal: "Fat Loss",
    weight: "68 kg",
    checkin: "Today",
  },
  {
    name: "Emily Brown",
    goal: "Muscle Gain",
    weight: "59 kg",
    checkin: "Tomorrow",
  },
  {
    name: "Michael Lee",
    goal: "Strength",
    weight: "82 kg",
    checkin: "25 Jul",
  },
  {
    name: "Jessica Wilson",
    goal: "Recomp",
    weight: "63 kg",
    checkin: "28 Jul",
  },
];

export default function RecentClients() {
  return (
    <section className="clients-table">
      <div className="table-header">
        <h2>Recent Clients</h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Goal</th>
            <th>Weight</th>
            <th>Next Check-in</th>
            <th>AI</th>
          </tr>
        </thead>

        <tbody>
          {clients.map((client) => (
            <tr key={client.name}>
              <td>{client.name}</td>
              <td>{client.goal}</td>
              <td>{client.weight}</td>
              <td>{client.checkin}</td>
              <td>
                <button className="analyze-btn">
                  Analyze
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}