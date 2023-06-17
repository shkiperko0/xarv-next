import { useState } from "react";
import { CScript } from "../base";
import { INodeEditorProps } from "../base/Node";
import { CFunctionNode, IValueState } from "./FunctionNode";
import { StateInput } from "../tools";
import { nodeEventer } from "../gui";

class CFunctionNodeNumber extends CFunctionNode<number> { }
type INumberValue = IValueState<number>

function Editor_FunctionNode_Number(props: INodeEditorProps<CFunctionNodeNumber>) {
  const state = useState(props.node.value)

  return <div>
    <StateInput<number>
      state={state}
      parse={s => Number(s)}
      format={n => String(n)}

      onChange={nvalue => {
        nodeEventer.trigger('onRefresh')
        props.node.value = nvalue
      }}
    />
  </div>
}

export class CMathNode_Multiplication extends CFunctionNodeNumber {  
  static Name = "CMathNode_Multiplication"
  static Description = "can mult value"

  static Editor = Editor_FunctionNode_Number
  func(state: INumberValue) {
    return { ...state, value: state.value * this.value };
  }
}

export class CMathNode_Subtraction extends CFunctionNodeNumber {
  static Name = "CMathNode_Subtraction"
  static Description = "can sub value"

  static Editor = Editor_FunctionNode_Number
  func(state: INumberValue) {
    return { ...state, value: state.value - this.value };
  }
}

export class CMathNode_Division extends CFunctionNodeNumber {
  static Name = "CMathNode_Division"
  static Description = "can divide value"

  static Editor = Editor_FunctionNode_Number
  func(state: INumberValue) {
    return { ...state, value: state.value / this.value };
  }
}

export class CMathNode_Addition extends CFunctionNodeNumber {
  static Name = "CMathNode_Addition"
  static Description = "can add value"

  static Editor = Editor_FunctionNode_Number
  func(state: INumberValue) {
    return { ...state, value: state.value + this.value };
  }
}

