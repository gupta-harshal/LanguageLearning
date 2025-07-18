export default function Dashboard() {
  return (
    <main className="light flex h-screen w-full items-stretch justify-start">
      <section
        className=" flex relative"
      >
        <div
          className="hover:bg-amber-900 w-1 cursor-col-resize absolute right-0 h-screen"
        ></div>
      </section>
      <section
        className={` p-10 flex-1 items-stretch justify-between h-full bg-primary-background`}
      >
        <div className=" w-full h-96 bg-pink-secondary/50">
        <h1>Streak</h1>
        
        </div>
      </section>
    </main>
  )
}
