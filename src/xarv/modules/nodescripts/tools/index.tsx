import { Dispatch, SetStateAction } from "react"

export interface StateProps<StateType=any>{
    state: [StateType, Dispatch<SetStateAction<StateType>>]
    format: (_: StateType) => string
    parse: (_: string) => StateType
    onChange?: (newState: StateType, lastState: StateType) => void
  }
  
  // Инпуты
  export function StateInput<StateType=any>(props: StateProps<StateType>) {
    const { format, state, parse, onChange } = props
    const [value, setValue] = state;
    return (
      <input
        // onClick={() => alert("a")}
        className="p-2 rounded-md "
        type="text"
        value={format(value)}
        onChange={(e) => {
          const n = parse(e.target.value);
          setValue(n);
          onChange && onChange(n, value);
        }}
      />
    );
  }