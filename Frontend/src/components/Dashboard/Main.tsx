import { useEffect, useRef, useState } from "react"
import HorizontalScroll from "../HorizontalScroll"

export default function Main() {
  const [isScrolling, setIsScrolling] = useState<boolean>(false)
  const mainScreen = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScrollStart = () => {
      setIsScrolling(true)
    }
    const handleScrollEnd = () => {
      setIsScrolling(false)
    }
    mainScreen.current &&
      mainScreen.current.addEventListener("scroll", handleScrollStart)
    mainScreen.current &&
      mainScreen.current.addEventListener("scrollend", handleScrollEnd)
    return () => {
      window.removeEventListener("scroll", handleScrollStart)
      window.removeEventListener("scrollend", handleScrollEnd)
    }
  }, [])

  return (
    <div
      ref={mainScreen}
      className={` flex flex-col  main-dashboard ml-12 p-4 overflow-y-scroll h-screen ${
        isScrolling ? "scrollbar-hidden-scrollbar" : "no-scrollbar"
      }`}
    >
      <section className=" flex flex-col p-2">
        <h1 className=" font-anglo-japanese text-3xl text-primary-font-color">
          Continue
        </h1>
        <HorizontalScroll>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0 cursor-pointer"></div>
        </HorizontalScroll>
        <h1 className=" font-anglo-japanese text-4xl text-primary-font-color">
          Continue
        </h1>
        <HorizontalScroll>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-[800px] bg-black rounded-xl snap-start shrink-0"></div>
        </HorizontalScroll>
        <h1 className=" font-anglo-japanese text-4xl text-primary-font-color">
          Continue
        </h1>
        <HorizontalScroll>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
          <div className=" h-72 w-96 bg-black rounded-xl snap-start shrink-0"></div>
        </HorizontalScroll>
      </section>
    </div>
  )
}
