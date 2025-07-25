import Header from "../components/Header"
import Button from "../components/Home/Button"
import PrintingText from "../components/PrintingText"
import TranslateBox from "../components/TranslateBox"

export default function Home() {
  return (
    <main 
    className="light bg-gradient-to-b from-primary-foreground via-white to-primary-button">
      <Header />
      <section className=" h-screen flex flex-row justify-center items-center gap-20 snap-start">
        <div className=" w-[625px] h-80">
          <PrintingText
            texts={[
              "Learn Japanese the right way !!!",
              "正しい 方法 で 日本語 を 学びましょう!!!",
            ]}
            className={[
              " font-anglo-japanese text-white text-8xl text-shadow-[5px_5px_1px] text-shadow-black/40 ",
              " font-japanese text-white text-8xl text-shadow-[5px_5px_1px] text-shadow-black/40",
            ]}
          />
        </div>
        <div className=" flex flex-col gap-7">
          <Button className=" bg-primary-button shadow-[#ff2054]">
            Get Started
          </Button>
          <Button className=" bg-secondary-button shadow-[#ff688b]">
            Already A Member
          </Button>
        </div>
      </section>
      <section className=" flex flex-col items-stretch w-full justify-stretch snap-start">
        <div className=" relative min-h-80 flex flex-row justify-center items-center">
          <TranslateBox
            heading="Hello"
            text="Woow"
            translatedHeading="こんにちは"
            translated="ok"
          />
        </div>
        <div className=" relative min-h-80 flex flex-row justify-center items-center">
          <TranslateBox
            heading="Hello"
            text="Woow"
            translatedHeading="こんにちは"
            translated="ok"
          />
        </div>
        <div className=" relative min-h-80 flex flex-row justify-center items-center">
          <TranslateBox
            heading="Hello"
            text="Woow"
            translatedHeading="こんにちは"
            translated="ok"
          />
        </div>
        <div className=" relative min-h-80 flex flex-row justify-center items-center">
          <TranslateBox
            heading="Hello"
            text="Woow"
            translatedHeading="こんにちは"
            translated="ok"
          />
        </div>
      </section>
    </main>
  )
}
