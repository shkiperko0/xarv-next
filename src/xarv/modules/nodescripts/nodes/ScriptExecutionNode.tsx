import { useState } from "react"
import { StateInput } from "../tools"
import { nodeEventer as we } from "../gui"
import { CNodeValue, CScriptNodeEvent, ScriptState } from "../base";
import { INodeEditorProps } from "../base/Node";
import { Button } from "src/xarv/components/button";

export class CScriptExecutionNode extends CScriptNodeEvent {
  static Name = "CScriptExecutionNode"
  static Description = "unspecified function node"
  
  static Editor = CScriptExecutionNodeExitor

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

  Exec(state: ScriptState) {

    this.script

    return state
  }

}

function CScriptExecutionNodeExitor(props: INodeEditorProps<CScriptExecutionNode>): JSX.Element {
  const [ value, setValue ] = useState<ScriptState>({})
  const [ state, setState ] = useState<[Error | null, string]>([null, ''])
  const [ err, text ] = state
  
  return <>
    <input 
      type="text" 
      value={text} 
      onChange={event =>{
        try{
          const text = JSON.stringify(state)
          setState([null, text])
        } catch(err: any){
          setState([err, text])
        }
      }}  
    />
    { err && <span>{err.message}</span> }

    <Button 
      onClick={event => {
        const executedState = props.node.Run(state)
        alert(JSON.stringify(executedState))
      }}
    >
      Execute
    </Button>
  </>
}



  
