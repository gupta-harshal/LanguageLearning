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
  className = "h-fit min-h-64 p-5 w-5/12 min-w-96 rounded-3xl text-3xl",
  color1 = "bg-primary-background",
  color2 = "bg-primary-button",
}: Input) {
  const [showTranslated, setShowTranslated] = useState<boolean>(true)
  const [translationText, setTranslationText] = useState<string>(translated)
  const [translationHeading, setTranslationHeading] =
    useState<string>(translatedHeading)
  useEffect(() => {
    if (translated === "" || translatedHeading === "") {
      fetchTranslate()
    }
  }, [])

  const fetchTranslate = async () => {
    // function to find translation of text and update translation
    setTranslationText(translated)
    setTranslationHeading(translatedHeading)
  }

  return (<>
      <div
        className={`${className} ${color1} absolute font-anglo-japanese shadow-[2px_2px_2px] shadow-black/50
      ${!showTranslated ? " z-10 translate-0" : " z-0 translate-3"} 
      duration-500 ease-in-out`}
      onClick={() => {
        setShowTranslated((x) => !x)
      }}
      >
        <h1 className=" text-4xl text-shadow-[1px_1px_0] 
        text-shadow-secondary-font-color text-primary-font-color">{heading}</h1>
        <p className=" text-lg text-secondary-font-color">{text}</p>
      </div>
      <div
        className={`${className} ${color2} absolute font-japanese shadow-[2px_2px_2px] shadow-black/50
      ${showTranslated ? " z-10 translate-0" : " z-0 translate-3"} 
      duration-500 ease-in-out`}
      onClick={() => {
        setShowTranslated((x) => !x)
      }}
      >
        <h1 className=" text-4xl text-shadow-[2px_2px_0] 
        text-shadow-[#ff2054] text-white">{translationHeading}</h1>
        <p className=" text-lg text-white text-shadow-[1px_1px_0] 
        text-shadow-[#ff2054]">{translationText}</p>
      </div>
    </>
  )
}
