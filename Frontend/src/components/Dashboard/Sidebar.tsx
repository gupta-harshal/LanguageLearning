import { useEffect } from "react"
import { createPortal } from "react-dom"
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
        `flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200 text-primary-font-color touch-manipulation
        ${isActive ? "bg-pink-primary/20 text-pink-primary" : "hover:bg-white/10 active:bg-white/15"}`
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

function SidebarChrome({
  open,
  onClose,
  mobile,
}: SidebarProps & { mobile?: boolean }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onClose()
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <aside
      className={
        mobile
          ? `fixed top-0 left-0 z-[80] flex h-[100dvh] w-[min(18rem,88vw)] flex-col
             glass-dark border-r border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]
             transition-transform duration-300 ease-out
             ${open ? "translate-x-0" : "-translate-x-full pointer-events-none"}`
          : `sticky top-0 z-30 hidden h-[100svh] w-20 hover:w-64 flex-col
             glass-dark border-r border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)]
             duration-300 transition-all ease-in-out group lg:flex overflow-hidden`
      }
    >
      <div className="shrink-0 flex items-center justify-between gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 border-b border-white/10">
        <NavLink
          to="/"
          onClick={onClose}
          className="font-anglo-japanese text-lg bg-gradient-to-r from-pink-primary to-blue-primary bg-clip-text text-transparent whitespace-nowrap"
        >
          日本語 Lab
        </NavLink>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-primary-font-color hover:bg-white/10 touch-manipulation"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      <nav
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-3"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <p className="px-3 mb-2 text-xs font-bold text-primary-font-color/50 uppercase tracking-wider lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          Menu
        </p>
        <div className="flex flex-col gap-1.5 pb-4">
          {majorItems.map((item) => (
            <div
              key={item.name}
              className="lg:[&>a>span:last-child]:opacity-0 lg:group-hover:[&>a>span:last-child]:opacity-100 [&>a>span:last-child]:transition-opacity"
            >
              <NavButton {...item} onNavigate={onClose} />
            </div>
          ))}
        </div>

        <p className="px-3 mb-2 mt-2 text-xs font-bold text-primary-font-color/50 uppercase tracking-wider lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
          More
        </p>
        <div className="flex flex-col gap-1.5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {minorItems.map((item) => (
            <div
              key={item.name}
              className="lg:[&>a>span:last-child]:opacity-0 lg:group-hover:[&>a>span:last-child]:opacity-100 [&>a>span:last-child]:transition-opacity"
            >
              <NavButton {...item} onNavigate={onClose} />
            </div>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-primary-font-color transition-all duration-200 hover:bg-red-500/15 active:bg-red-500/20 touch-manipulation"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/70 text-lg">
              🚪
            </span>
            <span className="whitespace-nowrap text-left font-semibold text-base lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              {user ? `Sign out (${user.name.split(" ")[0]})` : "Sign out"}
            </span>
          </button>
        </div>
      </nav>
    </aside>
  )
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const mobileDrawer =
    typeof document !== "undefined"
      ? createPortal(
          <>
            <div
              className={`fixed inset-0 z-[70] bg-black/55 transition-opacity lg:hidden ${
                open ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              onClick={onClose}
              aria-hidden={!open}
            />
            <div className="lg:hidden">
              <SidebarChrome open={open} onClose={onClose} mobile />
            </div>
          </>,
          document.body
        )
      : null

  return (
    <>
      {mobileDrawer}
      {/* Desktop rail stays in layout flow */}
      <SidebarChrome open={true} onClose={onClose} />
    </>
  )
}
