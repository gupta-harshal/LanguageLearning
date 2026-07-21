import { useState } from "react"
import { Link } from "react-router-dom"
import Streak from "../components/Dashboard/Streak"
import Sidebar from "../components/Dashboard/Sidebar"
import { useTheme } from "../ThemeContext"

const questCards = [
  {
    title: "Daily Quests",
    body: "Complete 3 lessons to earn a badge!",
    to: "/story",
  },
  {
    title: "Vocabulary",
    body: "Review words in the cloud matching game.",
    to: "/game1",
  },
  {
    title: "Space Practice",
    body: "Blast asteroids and reinforce kanji recall.",
    to: "/game2",
  },
]

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      className={`${
        isDarkMode ? "dark" : "light"
      } w-full min-h-[100svh] bg-primary-background text-primary-font-color overflow-x-hidden font-sans transition-colors duration-500`}
    >
      <button
        type="button"
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-[60] glass shadow-md px-3 sm:px-4 py-2 rounded-full font-bold hover:scale-105 transition-all text-xs sm:text-sm text-primary-font-color"
      >
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-[60] lg:hidden glass shadow-md px-3 py-2 rounded-full font-bold text-sm text-primary-font-color"
        aria-label="Open menu"
      >
        ☰ Menu
      </button>

      <main className="flex flex-col lg:flex-row min-h-[100svh] w-full relative z-10">
        <div
          className={`absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[150px] opacity-20 -z-10 ${
            isDarkMode ? "bg-purple-600" : "bg-primary-foreground/60"
          }`}
        />
        <div
          className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[150px] opacity-10 -z-10 ${
            isDarkMode ? "bg-pink-600" : "bg-pink-primary/40"
          }`}
        />

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 flex flex-col p-4 sm:p-6 lg:p-10 pt-20 lg:pt-10 overflow-y-auto z-20 min-w-0">
          <div
            className={`${
              isDarkMode ? "glass-dark" : "glass"
            } rounded-3xl w-full p-5 sm:p-8 shadow-2xl relative overflow-hidden text-primary-font-color`}
          >
            <div
              className={`absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -z-10 ${
                isDarkMode ? "bg-blue-500" : "bg-blue-primary/40"
              }`}
            />

            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-8 ${
                isDarkMode
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
                  : "text-primary-font-color"
              }`}
            >
              Welcome back, Learner!
            </h1>
            <p className="text-secondary-font-color mb-6 sm:mb-10 max-w-xl text-sm sm:text-base">
              Pick up where you left off — stories, games, and streaks all in one place.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {questCards.map((card) => (
                <Link
                  key={card.title}
                  to={card.to}
                  className={`${
                    isDarkMode
                      ? "glass"
                      : "bg-primary-background/70 border border-primary-font-color/10"
                  } block p-5 sm:p-6 rounded-2xl glow-border transition-transform hover:-translate-y-1 active:scale-[0.98]`}
                >
                  <h3 className="text-lg sm:text-xl font-bold text-primary-font-color mb-2">
                    {card.title}
                  </h3>
                  <p className="text-secondary-font-color text-sm sm:text-base">{card.body}</p>
                  <span className="mt-3 inline-block text-pink-primary text-sm font-semibold">
                    Open →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="p-4 sm:p-6 lg:p-8 w-full lg:w-[380px] xl:w-[420px] flex items-stretch justify-start z-30 shrink-0">
          <Streak />
        </section>
      </main>
    </div>
  )
}
