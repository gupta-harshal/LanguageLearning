import Streak from "../components/Dashboard/Streak"
import Sidebar from "../components/Dashboard/Sidebar"
import Main from "../components/Dashboard/Main"

export default function Dashboard() {
  return (
    <main className="light overflow-y-clip w-full flex justify-center items-stretch h-screen bg-secondary-button/50">
      <main className="light flex h-screen w-[95vw] items-stretch justify-start">
        <section className=" relative h-screen">
          <Sidebar/>
        </section>
        <section className=" w-[calc(100vw-384px-48px)] bg-primary-background">
          <Main/>
        </section>
        <section
          className={` p-10 w-96 flex items-stretch justify-between h-full bg-secondary-background`}
        >
          <Streak />
        </section>
      </main>
    </main>
  )
}
