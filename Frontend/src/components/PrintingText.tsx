import { useEffect, useState } from "react"

interface Input {
    texts : string[],
    className  ?: string[]
}

export default function PrintingText({ texts, className = [] }: Input) {
  const [typeSpeed, setTypeSpeed] = useState<number>(200)
  const [displayTextIndex, setDisplayTextIndex] = useState<number>(0)
  const [index, setIndex] = useState<number>(0)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => {
      tick()
    }, typeSpeed)
  }, [index])

  const tick = () => {
    if (isDeleting) {
      setIndex((x) => x - 1)
    } else {
      setIndex((x) => x + 1)
    }
    if (index >= texts[displayTextIndex].length) {
      setTypeSpeed(100)
      setIsDeleting(true)
    } else if (index < 0) {
      setDisplayTextIndex((x) => (x + 1) % texts.length)
      setTypeSpeed(200)
      setIsDeleting(false)
    }
  }
  return (
    <h1 className={` text-9xl ${className[displayTextIndex]}`}>
      {texts[displayTextIndex].substring(0, index)}
      <span className=" border-r-2 border-secondary-font-color animate-ping" />
    </h1>
  )
}
