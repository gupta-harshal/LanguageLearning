export default function SidebarMajorButtons({name, route} : {name : string, route : string}){
  route;
    return(
        <div className="flex items-center gap-2 hover:-translate-y-0.5 hover:scale-105 duration-100 hover:text-shadow-[0_4px_0] text-shadow-secondary-font-color/25 cursor-pointer justify-start px-2">
          <div className="bg-pink-500 rounded-4xl h-8 w-8 shrink-0" />
          <div className="h-full opacity-0 rotate-y-90 group-hover:rotate-y-0 group-hover:opacity-100 duration-200 origin-left">
            <h1 className="font-bold text-md pt-1 h-full">{name}</h1>
          </div>
        </div>
    )
}