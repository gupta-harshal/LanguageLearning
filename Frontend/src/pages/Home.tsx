import Button from "../components/Home/Button"
import PrintingText from "../components/PrintingText"

export default function Home() {
  return (
    <div className="light bg-gradient-to-b h-[2000px] from-primary-foreground via-white to-primary-button ">
      <div className=" h-screen flex flex-row">
        <div className=" w-96">
          <PrintingText
            texts={[
              "Learn Japanese the right way!!!",
              "正しい方法で日本語を学びましょう!!!",
            ]}
            className={[
              " font-anglo-japanese text-white text-6xl",
              " font-japanese text-white text-6xl",
            ]}
          />
        </div>
        <div className=" flex flex-col gap-7">
            <Button className=" bg-primary-button shadow-[#ff2054]">Get Started</Button>
            <Button className=" bg-secodary-button shadow-[#ff688b]">Get Started</Button>
        </div>
      </div>
    </div>
  )
}
