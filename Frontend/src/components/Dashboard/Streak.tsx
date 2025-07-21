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
    <div className=" w-full bg-pink-secondary/50 rounded-xl p-4 h-fit flex flex-col gap-5 justify-center items-stretch">
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
      <div className=" flex w-full justify-between items-center">
        <h1 className=" text-white text-shadow-primary-font-color text-shadow-[3px_2px_2px] font-anglo-japanese text-4xl">
          Streak
        </h1>
        <div className=" flex gap-5">
          <div
            className="font-semibold text-white text-shadow-[1px_1px_1px] text-shadow-secondary-font-color cursor-pointer"
            onClick={handleMonthDropdown}
          >
            {monthOptions.current[selectedMonth].text}
          </div>
          <div
            className=" cursor-pointer font-semibold text-white text-shadow-[1px_1px_1px] text-shadow-secondary-font-color"
            onClick={handleYearDropdown}
          >
            {selectedYear}
          </div>
        </div>
      </div>
      <Calendar month={selectedMonth} year={selectedYear} />
    </div>
  )
}
