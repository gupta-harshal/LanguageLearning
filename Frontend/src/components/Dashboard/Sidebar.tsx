export default function Sidebar() {
  return (
    <div className="group flex flex-col h-full justify-between items-stretch py-5 w-16 hover:w-48 duration-300 transition-all bg-secondary-background">
      <div className="flex flex-col gap-2 items-stretch justify-start">
        <div className="flex items-center gap-5 justify-start px-2">
          <div className="bg-pink-500 rounded-4xl h-12 w-12 shrink-0"></div>
          <h1 className="font-bold text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Home
          </h1>
        </div>
      </div>
    </div>
  )
}
