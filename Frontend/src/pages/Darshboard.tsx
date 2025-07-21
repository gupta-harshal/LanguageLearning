import Streak from "../components/Dashboard/Streak"
import Sidebar from "../components/Dashboard/Sidebar"

export default function Dashboard() {
  return (
    <body className="light w-full flex justify-center items-stretch h-screen bg-secondary-button/50">
      <main className="light flex h-screen w-[95vw] items-stretch justify-start">
        <section className=" relative h-screen">
          <Sidebar/>
        </section>
        <section className=" flex-1 bg-primary-background"></section>
        <section
          className={` p-10 w-96 flex items-stretch justify-between h-full bg-secondary-background`}
        >
          <Streak />
        </section>
      </main>
    </body>
  )
}
