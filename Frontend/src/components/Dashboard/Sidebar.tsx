import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

type NavItem = {
  name: string
  route: string
  icon: string
}

const majorItems: NavItem[] = [
  { name: "Home", route: "/", icon: "🏠" },
  { name: "Continue", route: "/dashboard", icon: "▶️" },
  { name: "Daily Quests", route: "/quests", icon: "⭐" },
  { name: "SRS Deck", route: "/srs", icon: "🧠" },
  { name: "Talk with ミケ", route: "/talk", icon: "📞" },
  { name: "Listening", route: "/listen", icon: "🎧" },
  { name: "Chat Room", route: "/chat", icon: "💬" },
  { name: "Vocab Journal", route: "/journal", icon: "📓" },
  { name: "Cloud Game", route: "/game1", icon: "☁️" },
  { name: "Space Shooter", route: "/game2", icon: "🚀" },
  { name: "Storybook", route: "/story", icon: "📖" },
]

const minorItems: NavItem[] = [
  { name: "Practice", route: "/TTS", icon: "🎤" },
  { name: "Account", route: "/account", icon: "👤" },
]

function NavButton({ name, route, icon, onNavigate }: NavItem & { onNavigate?: () => void }) {
  return (
    <NavLink
      to={route}
      end={route === "/dashboard" || route === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 text-primary-font-color
        ${isActive ? "bg-pink-primary/20 text-pink-primary" : "hover:bg-white/10"}`
      }
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-primary/80 text-lg">
        {icon}
      </span>
      <span className="font-semibold text-base whitespace-nowrap">{name}</span>
    </NavLink>
  )
}

type SidebarProps = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex flex-col h-full justify-between
          py-8 w-72 lg:w-20 lg:hover:w-64
          duration-300 transition-all ease-in-out
          glass-dark border-r border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]
          overflow-hidden group
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col gap-2 px-3 mt-4">
          <div className="flex items-center justify-between px-2 mb-4 lg:justify-start">
            <NavLink
              to="/"
              onClick={onClose}
              className="font-anglo-japanese text-lg bg-gradient-to-r from-pink-primary to-blue-primary bg-clip-text text-transparent whitespace-nowrap"
            >
              日本語 Lab
            </NavLink>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden rounded-full p-2 text-primary-font-color hover:bg-white/10"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <p className="px-3 mb-1 text-xs font-bold text-primary-font-color/50 uppercase tracking-wider lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            Menu
          </p>
          {majorItems.map((item) => (
            <div key={item.name} className="lg:[&>a>span:last-child]:opacity-0 lg:group-hover:[&>a>span:last-child]:opacity-100 [&>a>span:last-child]:transition-opacity">
              <NavButton {...item} onNavigate={onClose} />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 px-3 mb-6">
          <p className="px-3 mb-1 text-xs font-bold text-primary-font-color/50 uppercase tracking-wider lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            More
          </p>
          {minorItems.map((item) => (
            <div key={item.name} className="lg:[&>a>span:last-child]:opacity-0 lg:group-hover:[&>a>span:last-child]:opacity-100 [&>a>span:last-child]:transition-opacity">
              <NavButton {...item} onNavigate={onClose} />
            </div>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-primary-font-color transition-all duration-200 hover:bg-red-500/15"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/70 text-lg">
              🚪
            </span>
            <span className="whitespace-nowrap text-left font-semibold text-base lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              {user ? `Sign out (${user.name})` : "Sign out"}
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
