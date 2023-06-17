import { useState } from "react"
import { StateInput } from "../tools"
import { nodeEventer as we } from "../gui"
import { CNodeValue, ScriptState } from "../base";
import { CScriptNodeNormal } from "../base/Node";

export interface IValueState<Type> extends ScriptState {
  value: Type
}

export class CFunctionNode<Type = any> extends CScriptNodeNormal {
  static Name = "CFunctionNode"
  static Description = "unspecified function node"

  value!: Type
  func?(_:IValueState<Type>): IValueState<Type>  

  constructor() {
    super()

    const stateValue: CNodeValue = {
      name: "state",
      node: this,
    };

    this.values = [stateValue];

    this.io = [
      { to: stateValue, type: "in", node: this },
      { from: stateValue, type: "out", node: this },
    ];
  }

  Exec(state: IValueState<Type>) {
    return this.func ? this.func(state) : state
  }

}




  
