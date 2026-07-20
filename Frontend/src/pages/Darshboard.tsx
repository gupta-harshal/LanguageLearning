import Streak from "../components/Dashboard/Streak"
import Sidebar from "../components/Dashboard/Sidebar"

export default function Dashboard() {
  return (
    <div className="dark w-full min-h-screen bg-[#0f0f13] overflow-hidden font-sans">
      <main className="flex h-screen w-full relative z-10">
        
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[150px] opacity-10 -z-10"></div>

        <section className="relative h-screen z-50">
          <Sidebar />
        </section>
        
        <section className="flex-1 flex flex-col p-10 overflow-y-auto z-20">
          {/* Main Dashboard Content Area */}
          <div className="glass-dark rounded-3xl w-full h-full p-8 shadow-2xl relative overflow-hidden">
             {/* Inner ambient glow */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20 -z-10"></div>
             
             <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-8">
               Welcome back, Learner!
             </h1>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
               {/* Placeholder cards for future content to demonstrate the premium look */}
               <div className="glass p-6 rounded-2xl glow-border cursor-pointer transition-transform hover:-translate-y-2">
                 <h3 className="text-xl font-bold text-white mb-2">Daily Quests</h3>
                 <p className="text-gray-300">Complete 3 lessons to earn a badge!</p>
               </div>
               <div className="glass p-6 rounded-2xl glow-border cursor-pointer transition-transform hover:-translate-y-2">
                 <h3 className="text-xl font-bold text-white mb-2">Vocabulary</h3>
                 <p className="text-gray-300">Review 20 words today.</p>
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
