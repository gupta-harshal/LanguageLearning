import { motion, useMotionValue, useTransform } from "framer-motion"
import Header from "../components/Header"
import Button from "../components/Home/Button"
import PrintingText from "../components/PrintingText"
import TranslateBox from "../components/TranslateBox"
import manekiNeko from "../assets/maneki_neko.png"
import React from "react"

function TiltImage({ src, alt }: { src: string, alt: string }) {
  const x = useMotionValue(200)
  const y = useMotionValue(200)

  const rotateX = useTransform(y, [0, 400], [15, -15])
  const rotateY = useTransform(x, [0, 400], [-15, 15])

  function handleMouse(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const rect = event.currentTarget.getBoundingClientRect()
    x.set(event.clientX - rect.left)
    y.set(event.clientY - rect.top)
  }

  function handleMouseLeave() {
    x.set(200)
    y.set(200)
  }

  return (
    <motion.div
      style={{
        display: "flex",
        placeItems: "center",
        placeContent: "center",
        width: 400,
        height: 400,
        perspective: 800,
      }}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
    >
      <motion.img
        src={src}
        alt={alt}
        className="floating"
        style={{
          width: 350,
          height: 350,
          objectFit: "contain",
          rotateX,
          rotateY,
          filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.4))",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
    </motion.div>
  )
}

export default function Home() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  return (
    <main className={`${isDarkMode ? 'dark premium-gradient-bg' : 'light bg-gradient-to-b from-primary-foreground via-white to-primary-button'} min-h-screen text-primary-font-color overflow-x-hidden transition-colors duration-500`}>
      <div className="absolute top-4 right-4 z-50">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="glass shadow-md px-4 py-2 rounded-full font-bold hover:scale-105 transition-all text-sm"
        >
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <Header />
      <section className="min-h-screen flex flex-row justify-center items-center gap-10 lg:gap-32 snap-start px-10">
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
        <div className="hidden lg:flex z-10 relative">
           <div className="absolute inset-0 bg-pink-500 rounded-full blur-[120px] opacity-20 -z-10 animate-pulse"></div>
           <TiltImage src={manekiNeko} alt="3D Maneki Neko" />
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
