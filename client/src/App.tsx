import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Log from "./pages/Log";
import History from "./pages/History";
import SessionDetail from "./pages/SessionDetail";
import Progress from "./pages/Progress";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<Log />} />
          <Route path="/history" element={<History />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
