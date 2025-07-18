interface Options {
  options: Option[]
  hideModal: () => void
  className? : string
}
export interface Option {
  text: string
  callback: () => void
}

export default function Dropdown({ options = [], hideModal, className }: Options) {
  return (
    <div className={` fixed ${className}`}>
      {options.map(({ text, callback }: Option) => {
        return (
          <h1
            onClick={() => {
              hideModal()
              callback()
            }}
          >
            {text}
          </h1>
        )
      })}
    </div>
  )
}
