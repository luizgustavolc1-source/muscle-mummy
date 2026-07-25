import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppShell from "./components/app/AppShell";
import Client from "./pages/Client/Client";
import Clients from "./pages/Clients/Clients";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import { useSession } from "./services/session";

function Protected({ children }) {
  const { session, loading } = useSession();
  if (loading) return <div className="loading-screen">Loading Muscle Mummy…</div>;
  return session ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return <><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Protected><AppShell /></Protected>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/clients/:id" element={<Client />} />
    </Route>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes><Toaster richColors position="top-right" /></>;
}
