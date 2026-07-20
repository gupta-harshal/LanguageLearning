import { useEffect, useRef, useState } from "react"
import Calendar from "./Calendar"
import ModalPortal from "../Modals/ModalPortal"
import Dropdown, { type Option } from "../Modals/Dropdown"

export default function Streak() {
  const [monthDropdownVisible, setMonthDropdownVisible] =
    useState<boolean>(false)
  const [yearDropdownVisible, setYearDropdownVisible] = useState<boolean>(false)
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )
  const [modalPosition, setModalPosition] = useState<{
    left: number
    top: number
  }>({ top: 0, left: 0 })

  const yearOptions = useRef<Option[]>([])
  const monthOptions = useRef<Option[]>([
    {
      text: "Jan",
      callback: () => {
        setSelectedMonth(0)
      },
    },
    {
      text: "Feb",
      callback: () => {
        setSelectedMonth(1)
      },
    },
    {
      text: "Mar",
      callback: () => {
        setSelectedMonth(2)
      },
    },
    {
      text: "Apr",
      callback: () => {
        setSelectedMonth(3)
      },
    },
    {
      text: "May",
      callback: () => {
        setSelectedMonth(4)
      },
    },
    {
      text: "Jun",
      callback: () => {
        setSelectedMonth(5)
      },
    },
    {
      text: "Jul",
      callback: () => {
        setSelectedMonth(6)
      },
    },
    {
      text: "Aug",
      callback: () => {
        setSelectedMonth(7)
      },
    },
    {
      text: "Sep",
      callback: () => {
        setSelectedMonth(8)
      },
    },
    {
      text: "Oct",
      callback: () => {
        setSelectedMonth(9)
      },
    },
    {
      text: "Nov",
      callback: () => {
        setSelectedMonth(10)
      },
    },
    {
      text: "Dec",
      callback: () => {
        setSelectedMonth(11)
      },
    },
  ])

  useEffect(() => {
    yearOptions.current = []
    for (
      let i = new Date().getFullYear();
      i >= Math.max(2025 /*new Date(user.createdAt).getFullYear() */);
      i--
    ) {
      yearOptions.current.push({
        text: i.toString(),
        callback: () => {
          setSelectedYear(i)
        },
      })
    }
  }, [])

  useEffect(() => {
    if (Number(new Date()) < Number(new Date(selectedYear, selectedMonth, 1))) {
      setSelectedMonth(new Date().getMonth())
      setSelectedYear(new Date().getFullYear())
    }
  }, [selectedMonth, selectedYear])

  const handleMonthDropdown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setMonthDropdownVisible(true)
    setModalPosition({ left: e.clientX, top: e.clientY + 10 })
  }

  const handleYearDropdown = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    setYearDropdownVisible(true)
    setModalPosition({ left: e.clientX, top: e.clientY + 10 })
  }

  const hideModal = () => {
    setMonthDropdownVisible(false)
    setYearDropdownVisible(false)
  }

  return (
    <div className="w-full glass-dark rounded-3xl p-6 h-fit flex flex-col gap-6 justify-center items-stretch relative overflow-hidden glow-border">
      {/* Decorative fire/flame background element for streak */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full mix-blend-screen filter blur-[60px] opacity-20 pointer-events-none"></div>
      {yearDropdownVisible && (
        <ModalPortal hideModal={hideModal}>
          <Dropdown
            style={{ top: modalPosition.top, left: modalPosition.left }}
            options={yearOptions.current}
            hideModal={hideModal}
          />
        </ModalPortal>
      )}
      {monthDropdownVisible && (
        <ModalPortal hideModal={hideModal}>
          <Dropdown
            style={{ top: modalPosition.top, left: modalPosition.left }}
            options={
              selectedYear !== new Date().getFullYear()
                ? monthOptions.current
                : monthOptions.current.slice(0, new Date().getMonth() + 1)
            }
            hideModal={hideModal}
          />
        </ModalPortal>
      )}
      <div className="flex w-full justify-between items-center z-10 border-b border-white/10 pb-4">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 font-anglo-japanese text-4xl flex items-center gap-2">
          <span className="text-orange-500">🔥</span> Streak
        </h1>
        <div className="flex gap-4 bg-white/5 p-2 rounded-full border border-white/10 shadow-inner">
          <div
            className="px-4 py-1 rounded-full hover:bg-white/10 transition-colors font-bold text-gray-200 cursor-pointer"
            onClick={handleMonthDropdown}
          >
            {monthOptions.current[selectedMonth].text}
          </div>
          <div
            className="px-4 py-1 rounded-full hover:bg-white/10 transition-colors font-bold text-gray-200 cursor-pointer"
            onClick={handleYearDropdown}
          >
            {selectedYear}
          </div>
        </div>
      </div>
      <div className="z-10 bg-white/5 rounded-2xl p-4 backdrop-blur-md border border-white/5 shadow-2xl">
        <Calendar month={selectedMonth} year={selectedYear} />
      </div>
    </div>
  )
}
