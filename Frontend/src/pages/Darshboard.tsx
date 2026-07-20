import Streak from "../components/Dashboard/Streak"
import Sidebar from "../components/Dashboard/Sidebar"
import { useTheme } from "../ThemeContext"

export default function Dashboard() {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <div className={`${isDarkMode ? "dark" : "light"} w-full min-h-screen bg-primary-background text-primary-font-color overflow-hidden font-sans transition-colors duration-500`}>
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-[60] glass shadow-md px-4 py-2 rounded-full font-bold hover:scale-105 transition-all text-sm text-primary-font-color"
      >
        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </button>
      <main className="flex h-screen w-full relative z-10">
        
        {/* Ambient background glows */}
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[150px] opacity-20 -z-10 ${isDarkMode ? "bg-purple-600" : "bg-primary-foreground/60"}`}></div>
        <div className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-[150px] opacity-10 -z-10 ${isDarkMode ? "bg-pink-600" : "bg-pink-primary/40"}`}></div>

        <section className="relative h-screen z-50">
          <Sidebar />
        </section>
        
        <section className="flex-1 flex flex-col p-10 overflow-y-auto z-20">
          {/* Main Dashboard Content Area */}
          <div className={`${isDarkMode ? "glass-dark" : "glass"} rounded-3xl w-full h-full p-8 shadow-2xl relative overflow-hidden text-primary-font-color`}>
             {/* Inner ambient glow */}
             <div className={`absolute top-0 right-0 w-64 h-64 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -z-10 ${isDarkMode ? "bg-blue-500" : "bg-blue-primary/40"}`}></div>
             
             <h1 className={`text-5xl font-bold mb-8 ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400" : "text-primary-font-color"}`}>
               Welcome back, Learner!
             </h1>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
               {/* Placeholder cards for future content to demonstrate the premium look */}
               <div className={`${isDarkMode ? "glass" : "bg-primary-background/70 border border-primary-font-color/10"} p-6 rounded-2xl glow-border cursor-pointer transition-transform hover:-translate-y-2`}>
                 <h3 className="text-xl font-bold text-primary-font-color mb-2">Daily Quests</h3>
                 <p className="text-secondary-font-color">Complete 3 lessons to earn a badge!</p>
               </div>
               <div className={`${isDarkMode ? "glass" : "bg-primary-background/70 border border-primary-font-color/10"} p-6 rounded-2xl glow-border cursor-pointer transition-transform hover:-translate-y-2`}>
                 <h3 className="text-xl font-bold text-primary-font-color mb-2">Vocabulary</h3>
                 <p className="text-secondary-font-color">Review 20 words today.</p>
               </div>
             </div>
          </div>
        </section>
        
        <section className="p-8 w-[450px] flex items-stretch justify-start h-full z-30">
          <Streak />
        </section>
      </main>
    </div>
  )
}
