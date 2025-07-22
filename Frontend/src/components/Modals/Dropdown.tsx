interface Options {
  options: Option[]
  hideModal: () => void
  style? : React.CSSProperties
}
export interface Option {
  text: string
  callback: () => void
}

export default function Dropdown({ options = [], hideModal, style }: Options) {
  return (
    <div className={` fixed p-2 w-24 max-h-36 overflow-y-scroll no-scrollbar text-center border-primary-font-color`} style={style}>
      {options.map(({ text, callback }: Option) => {
        return (
          <div
          className=" bg-white border-[1px] border-b-[1px] border-secondary-font-color cursor-pointer hover:-translate-x-1 hover:-translate-y-1 duration-150"
            onClick={() => {
              hideModal()
              callback()
            }}
          >
            {text}
          </div>
        )
      })}
    </div>
  )
}
