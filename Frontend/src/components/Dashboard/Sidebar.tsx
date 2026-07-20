import SidebarMajorButtons from "./SidebarMajorButtons"
import SidebarMinorButtons from "./SidebarMinorButtons"

export default function Sidebar() {
  return (
    <div className="group absolute left-0 z-50 flex flex-col h-full justify-between items-stretch py-10 w-20 hover:w-64 duration-300 transition-all ease-in-out glass-dark border-r border-white/10 shadow-[5px_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
      <div className="flex flex-col gap-4 items-stretch justify-start px-2 mt-10">
        <div className="px-4 mb-4 text-xs font-bold text-primary-font-color/60 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Menu
        </div>
        <SidebarMajorButtons name="Continue" route="" />
        <SidebarMajorButtons name="Games" route="" />
        <SidebarMajorButtons name="Practice" route="" />
      </div>
      <div className="flex flex-col gap-4 items-stretch justify-start px-2 mb-10">
        <div className="px-4 mb-2 text-xs font-bold text-primary-font-color/60 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          More
        </div>
        <SidebarMinorButtons name="Profile" route="" />
        <SidebarMinorButtons name="Settings" route="" />
        <SidebarMinorButtons name="Contact" route="" />
      </div>
    </div>
  )
}
