import { useEffect, useRef, useState } from "react"
import Calendar from "./Calendar"
import ModalPortal from "../Modals/ModalPortal"
import Dropdown, { type Option } from "../Modals/Dropdown"

export default function Streak() {
  const [monthDropdownVisible, setMonthDropdownVisible] = useState<boolean>(false)
  const [yearDropdownVisible, setYearDropdownVisible] = useState<boolean>(false)
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  )
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )

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
    for (
      let i = new Date().getFullYear();
      i >= Math.max(2000, new Date(/*user.createdAt*/).getFullYear());
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

  const handleMonthDropdown = () => {
    setMonthDropdownVisible(true)
  }

  const handleYearDropdown = () => {
    setYearDropdownVisible(true)
  }

  const hideModal = () => {
    setMonthDropdownVisible(false)
    setYearDropdownVisible(false)
  }

  return (
    <div className=" w-full h-96">
      {yearDropdownVisible && (
        <ModalPortal hideModal={hideModal}>
          <Dropdown options={yearOptions.current} hideModal={hideModal} />
        </ModalPortal>
      )}
      {monthDropdownVisible && (
        <ModalPortal hideModal={hideModal}>
          <Dropdown options={monthOptions.current} hideModal={hideModal} />
        </ModalPortal>
      )}
      <div className=" flex w-full justify-between items-center px-5">
        <h1>Streak</h1>
        <div>
          <h1 onClick={handleMonthDropdown}>
            {new Date().toLocaleString("default", { month: "short" })}
          </h1>
          <h1 onClick={handleYearDropdown}>
            {new Date().toLocaleString("default", { year: "numeric" })}
          </h1>
        </div>
      </div>
      <Calendar month={selectedMonth} year={selectedYear} />
    </div>
  )
}
