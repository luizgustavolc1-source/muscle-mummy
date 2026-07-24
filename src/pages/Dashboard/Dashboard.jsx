import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import DashboardCards from "../../components/dashboard/DashboardCards";
import RecentClients from "../../components/dashboard/RecentClients";

import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />
        <DashboardCards />
        <RecentClients />
      </div>
    </div>
  );
}