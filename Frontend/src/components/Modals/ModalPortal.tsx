import { useEffect } from "react"
import { createPortal } from "react-dom"

export default function ModalPortal({
  children,
  hideModal,
}: {
  children: React.ReactNode
  hideModal: () => void
}) {
  useEffect(() => {
    const overflow = document.body.style.overflow
    const scrollY = window.scrollY
    document.body.style.overflow = "hidden"
    document.body.style.position = "fixed"
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = "100%"

    return () => {
      document.body.style.overflow = overflow
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }
  }, [])

  return createPortal(
    <div className=" inset-0 absolute z-50" onClick={hideModal}>
      {children}
    </div>,
    document.body
  )
}
