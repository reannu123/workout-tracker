import { NavLink } from "react-router-dom";
import { Dumbbell } from "./icons";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/log", label: "Log" },
  { to: "/history", label: "History" },
  { to: "/progress", label: "Progress" },
];

export default function NavBar() {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg">
          <Dumbbell /> Workout Tracker
        </NavLink>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg transition-colors ${
                  isActive ? "bg-emerald-600 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
