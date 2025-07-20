export default function SidebarMinorButtons({name, route} : {name : string, route : string}){
  route;
    return(
        <div className="flex items-center gap-2 justify-start px-3 hover:-translate-y-0.5 hover:scale-105 duration-100 hover:text-shadow-[0_4px_0] text-shadow-secondary-font-color/25 cursor-pointer ">
          <div className="bg-pink-500 rounded-4xl h-6 w-6 shrink-0"></div>
          <h1 className="font-semibold text-md pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {name}
          </h1>
        </div>
    )
}