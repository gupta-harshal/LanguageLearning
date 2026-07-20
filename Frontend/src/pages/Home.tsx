import Header from "../components/Header"
import Button from "../components/Home/Button"
import PrintingText from "../components/PrintingText"
import TranslateBox from "../components/TranslateBox"
import Spline from "@splinetool/react-spline"
import { useTheme } from "../ThemeContext"

export default function Home() {
  const { isDarkMode } = useTheme()

  return (
    <main className={`${isDarkMode ? 'dark premium-gradient-bg' : 'light bg-gradient-to-b from-primary-background via-primary-foreground/25 to-primary-button'} min-h-screen text-primary-font-color overflow-x-hidden transition-colors duration-500`}>
      <Header />
      <section className="min-h-screen flex flex-col lg:flex-row justify-center items-center gap-10 lg:gap-24 snap-start px-10 pt-24">
        <div className="flex flex-col gap-10 z-10 max-w-2xl">
          <div className="h-40 lg:h-60">
            <PrintingText
              texts={[
                "Learn Japanese the right way !!!",
                "正しい 方法 で 日本語 を 学びましょう!!!",
              ]}
              className={[
                `font-anglo-japanese text-6xl lg:text-7xl drop-shadow-2xl ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400' : 'text-white text-shadow-[5px_5px_1px] text-shadow-black/40'}`,
                `font-japanese text-5xl lg:text-7xl drop-shadow-2xl ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400' : 'text-white text-shadow-[5px_5px_1px] text-shadow-black/40'}`,
              ]}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-7">
            <Button className={isDarkMode ? "bg-gradient-to-r from-pink-primary to-pink-tertiary shadow-[0_0_20px_rgba(255,32,84,0.6)] hover:shadow-[0_0_30px_rgba(255,32,84,0.8)] border-none text-white px-8 py-4 text-xl font-bold rounded-full transition-all hover:scale-105" : "bg-primary-button shadow-[#ff2054] px-8 py-4 text-xl font-bold rounded-full"}>
              Get Started
            </Button>
            <Button className={isDarkMode ? "glass shadow-lg border-white/20 text-white px-8 py-4 text-xl font-bold rounded-full transition-all hover:bg-white/10 hover:scale-105" : "bg-secondary-button shadow-[#ff688b] px-8 py-4 text-xl font-bold rounded-full"}>
              Already A Member
            </Button>
          </div>
        </div>
        
        {/* 3D Maneki Neko Section */}
        <div className="z-10 relative flex items-center justify-center w-full max-w-[440px] h-[520px]">
           <div className="absolute inset-0 bg-pink-500 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse"></div>
           <div className={`relative w-full h-full rounded-[2rem] overflow-hidden border shadow-[0_30px_80px_rgba(0,0,0,0.35)] ${isDarkMode ? "border-white/10 glass-dark" : "border-primary-font-color/10 glass"}`}>
             <div className="absolute top-4 left-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-bold tracking-widest text-white backdrop-blur-sm">
               Interactive Maneki Neko
             </div>
             <Spline className="w-full h-full" scene="https://prod.spline.design/K2gm9ROX4v8PafQX/scene.splinecode" />
           </div>
        </div>
      </section>

      <section className="flex flex-col items-center w-full justify-start py-20 snap-start gap-12 relative">
        <div className={`absolute top-0 w-full h-32 bg-gradient-to-b ${isDarkMode ? 'from-[#1a1a24]' : 'from-primary-button'} to-transparent z-0 transition-colors duration-500`}></div>
        <h2 className="text-4xl font-anglo-japanese mb-10 z-10 text-shadow-lg">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl px-10 z-10">
          <div className={`relative min-h-80 flex flex-row justify-center items-center ${isDarkMode ? 'glass-dark' : 'bg-white/40'} rounded-2xl p-6 transition-transform hover:-translate-y-2 glow-border`}>
            <TranslateBox heading="Welcome" text="To fun Japanese learning!" translatedHeading="ようこそ" translated="楽しい日本語学習へ！" />
          </div>
          <div className={`relative min-h-80 flex flex-row justify-center items-center ${isDarkMode ? 'glass-dark' : 'bg-white/40'} rounded-2xl p-6 transition-transform hover:-translate-y-2 glow-border`}>
            <TranslateBox heading="Vocabulary Book" text="Let's memorize new words!" translatedHeading="単語帳" translated="新しい言葉を覚えよう！" />
          </div>
          <div className={`relative min-h-80 flex flex-row justify-center items-center ${isDarkMode ? 'glass-dark' : 'bg-white/40'} rounded-2xl p-6 transition-transform hover:-translate-y-2 glow-border`}>
            <TranslateBox heading="Story" text="Let's read Japanese folktales!" translatedHeading="物語" translated="日本の昔話を読もう！" />
          </div>
          <div className={`relative min-h-80 flex flex-row justify-center items-center ${isDarkMode ? 'glass-dark' : 'bg-white/40'} rounded-2xl p-6 transition-transform hover:-translate-y-2 glow-border`}>
            <TranslateBox heading="Game" text="Let's learn while playing!" translatedHeading="ゲーム" translated="遊びながら学ぼう！" />
          </div>
        </div>
      </section>
    </main>
  )
}
