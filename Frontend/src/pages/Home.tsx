import Header from "../components/Header"
import Button from "../components/Home/Button"
import PrintingText from "../components/PrintingText"
import TranslateBox from "../components/TranslateBox"
import ManekiNekoScene from "../components/Home/ManekiNekoScene"
import { useTheme } from "../ThemeContext"
import { useAuth } from "../context/AuthContext"

const featureCards = [
  {
    heading: "Welcome",
    text: "Start your journey with bite-sized lessons that feel like play, not homework.",
    translatedHeading: "ようこそ",
    translated: "宿題じゃなく、遊びのように学べる小さなレッスンから始めよう。",
  },
  {
    heading: "Vocabulary",
    text: "Flip cards, hear each word, and lock new Japanese into long-term memory.",
    translatedHeading: "単語帳",
    translated: "カードをめくり、音を聞いて、新しい日本語をしっかり覚えよう。",
  },
  {
    heading: "Storybook",
    text: "Read classic folktales side by side in English and Japanese — tap to translate.",
    translatedHeading: "物語",
    translated: "昔話を英語と日本語で並べて読もう。タップで翻訳できるよ。",
  },
  {
    heading: "Games",
    text: "Drag clouds, shoot asteroids, and earn streaks while your vocab levels up.",
    translatedHeading: "ゲーム",
    translated: "雲をドラッグしたり、小惑星を撃ったりして、遊びながら語彙を伸ばそう。",
  },
]

export default function Home() {
  const { isDarkMode } = useTheme()
  const { isAuthenticated } = useAuth()

  return (
    <main
      className={`${
        isDarkMode
          ? "dark premium-gradient-bg"
          : "light bg-gradient-to-b from-primary-background via-primary-foreground/25 to-primary-button"
      } min-h-screen text-primary-font-color overflow-x-hidden transition-colors duration-500`}
    >
      <Header />
      <section className="min-h-[100svh] flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-20 snap-start px-5 sm:px-10 pt-24 pb-12">
        <div className="flex flex-col gap-8 z-10 max-w-2xl w-full">
          <div className="min-h-32 sm:min-h-40 lg:min-h-60">
            <PrintingText
              texts={[
                "Learn Japanese the right way !!!",
                "正しい 方法 で 日本語 を 学びましょう!!!",
              ]}
              className={[
                `font-anglo-japanese text-4xl sm:text-6xl lg:text-7xl drop-shadow-2xl ${
                  isDarkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
                    : "text-white text-shadow-[5px_5px_1px] text-shadow-black/40"
                }`,
                `font-japanese text-3xl sm:text-5xl lg:text-7xl drop-shadow-2xl ${
                  isDarkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
                    : "text-white text-shadow-[5px_5px_1px] text-shadow-black/40"
                }`,
              ]}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-7">
            <Button
              to={isAuthenticated ? "/dashboard" : "/signup"}
              className={
                isDarkMode
                  ? "bg-gradient-to-r from-pink-primary to-pink-tertiary shadow-[0_0_20px_rgba(255,32,84,0.6)] hover:shadow-[0_0_30px_rgba(255,32,84,0.8)] border-none rounded-full transition-all hover:scale-105"
                  : "bg-primary-button shadow-[#ff2054] rounded-full"
              }
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
            </Button>
            <Button
              to={isAuthenticated ? "/dashboard" : "/login"}
              className={
                isDarkMode
                  ? "glass shadow-lg border-white/20 rounded-full transition-all hover:bg-white/10 hover:scale-105"
                  : "bg-secondary-button shadow-[#ff688b] rounded-full"
              }
            >
              {isAuthenticated ? "Continue" : "Already A Member"}
            </Button>
          </div>
        </div>

        <div className="z-10 relative flex items-center justify-center w-full max-w-[440px] h-[420px] sm:h-[520px]">
          <div className="absolute inset-0 bg-pink-500 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse" />
          <div
            className={`relative w-full h-full rounded-[2rem] overflow-hidden border shadow-[0_30px_80px_rgba(0,0,0,0.35)] ${
              isDarkMode ? "border-white/10 glass-dark" : "border-primary-font-color/10 glass"
            }`}
          >
            <div className="absolute top-4 left-4 z-10 rounded-full bg-black/40 px-3 py-1 text-xs font-bold tracking-widest text-white backdrop-blur-sm">
              Interactive Maneki Neko
            </div>
            <ManekiNekoScene />
          </div>
        </div>
      </section>

      <section className="flex flex-col items-center w-full justify-start py-16 sm:py-20 snap-start gap-10 relative">
        <div
          className={`absolute top-0 w-full h-32 bg-gradient-to-b ${
            isDarkMode ? "from-[#1a1a24]" : "from-primary-button"
          } to-transparent z-0 transition-colors duration-500`}
        />
        <h2 className="text-3xl sm:text-4xl font-anglo-japanese z-10 text-shadow-lg px-4 text-center">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 w-full max-w-5xl px-5 sm:px-10 z-10">
          {featureCards.map((card) => (
            <div
              key={card.heading}
              className={`relative min-h-72 sm:min-h-80 flex flex-row justify-center items-center ${
                isDarkMode ? "glass-dark" : "bg-white/40"
              } rounded-2xl p-4 sm:p-6 transition-transform hover:-translate-y-2 glow-border`}
            >
              <TranslateBox {...card} />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
