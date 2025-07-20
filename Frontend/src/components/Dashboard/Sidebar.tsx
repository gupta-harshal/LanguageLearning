import SidebarMajorButtons from "./SidebarMajorButtons"
import SidebarMinorButtons from "./SidebarMinorButtons"

export default function Sidebar() {
  return (
    <div className="group absolute left-0 z-50 flex flex-col h-full justify-between items-stretch py-10 w-12 hover:w-fit duration-100 transition-all bg-secondary-background">
      <div className="flex flex-col gap-2 items-stretch justify-start">
        <SidebarMajorButtons name="Continue" route="" />
        <SidebarMajorButtons name="Games" route="" />
        <SidebarMajorButtons name="Practice" route="" />
      </div>
      <div className="flex flex-col gap-2 items-stretch justify-start">
        <SidebarMinorButtons name="Profile" route="" />
        <SidebarMinorButtons name="Settings" route="" />
        <SidebarMinorButtons name="Contact" route="" />
      </div>
    </div>
  )
}
