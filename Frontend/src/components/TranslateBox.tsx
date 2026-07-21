import { useEffect, useState } from "react"

interface Input {
  text: string
  heading: string
  translated?: string
  className?: string
  color1?: string
  color2?: string
  translatedHeading?: string
}

export default function TranslateBox({
  text,
  heading,
  translated = "",
  translatedHeading = "",
  className = "h-fit min-h-56 sm:min-h-64 p-5 w-full max-w-sm rounded-3xl text-3xl",
  color1 = "bg-primary-background",
  color2 = "bg-primary-button",
}: Input) {
  const [showTranslated, setShowTranslated] = useState(true)
  const [translationText, setTranslationText] = useState(translated)
  const [translationHeading, setTranslationHeading] = useState(translatedHeading)

  useEffect(() => {
    setTranslationText(translated)
    setTranslationHeading(translatedHeading)
  }, [translated, translatedHeading])

  return (
    <>
      <div
        className={`${className} ${color1} absolute font-anglo-japanese shadow-[2px_2px_2px] shadow-black/50 cursor-pointer
      ${!showTranslated ? "z-10 translate-0" : "z-0 translate-3"}
      duration-500 ease-in-out`}
        onClick={() => setShowTranslated((x) => !x)}
      >
        <h1 className="text-3xl sm:text-4xl text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-primary-font-color">
          {heading}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-secondary-font-color leading-relaxed">{text}</p>
        <p className="mt-4 text-xs uppercase tracking-wider text-secondary-font-color/70">Tap to flip</p>
      </div>
      <div
        className={`${className} ${color2} absolute font-japanese shadow-[2px_2px_2px] shadow-black/50 cursor-pointer
      ${showTranslated ? "z-10 translate-0" : "z-0 translate-3"}
      duration-500 ease-in-out`}
        onClick={() => setShowTranslated((x) => !x)}
      >
        <h1 className="text-3xl sm:text-4xl text-shadow-[2px_2px_0] text-shadow-[#ff2054] text-white">
          {translationHeading}
        </h1>
        <p className="mt-2 text-base sm:text-lg text-white text-shadow-[1px_1px_0] text-shadow-[#ff2054] leading-relaxed">
          {translationText}
        </p>
        <p className="mt-4 text-xs uppercase tracking-wider text-white/70">タップして裏返す</p>
      </div>
    </>
  )
}
