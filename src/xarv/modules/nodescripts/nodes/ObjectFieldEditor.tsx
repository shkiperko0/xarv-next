import { useState } from "react";
import { StateInput } from "../tools";
import { nodeEventer as we } from "../gui"
import { CNodeValue, CScriptNodeNormal, ScriptState } from "../base";
import { CirclePointer } from "../gui/common";
import { INodeEditorProps } from "../base/Node";

export class CObjectFieldEditor extends CScriptNodeNormal {
  static Name = "CObjectFieldEditor";
  static Description = "This node can edit object field value";
  static Editor = CTestNodeFieldEditor

    keyName: string | null = null;
    value: string | null = null;
  
    constructor() {
      super();
  
      const valueA: CNodeValue = {
        name: "key",
        node: this,
      };
  
      const valueB: CNodeValue = {
        name: "value",
        node: this,
      };
  
      const valueC: CNodeValue = {
        name: "field",
        node: this,
      };
  
      this.values = [valueA, valueB, valueC];
  
      this.io = [
        { type: "in", to: valueA, node: this },
        { type: "in", to: valueB, node: this },
        { type: "out", from: valueC, node: this },
      ];
    }
  
    Exec(state: ScriptState): ScriptState {
      return { ...state, ...(this.keyName ? { [this.keyName]: this.value } : {}) };
    }
  }

  function CTestNodeFieldEditor(props: INodeEditorProps){
    const keyNameState = useState<string | null>(props.node.keyName);
    const valueState = useState<string | null>(props.node.value);
  
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <CirclePointer color={'blue'} />
          <StateInput<string | null>
            state={keyNameState}
            onChange={(nvalue) => {
              props.node.keyName = nvalue;
              we.trigger("onRefresh");
            }}
            parse={ s => s ? String(s) : null }
            format={ s => String(s) }
          />
         <CirclePointer color={'blue'} />
        </div>

        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
          <CirclePointer color={'blue'} />
          <StateInput<string | null>
            state={valueState}
            onChange={(nvalue) => {
              props.node.value = nvalue;
              we.trigger("onRefresh");
            }}
            parse={ s => s ? String(s) : null }
            format={ s => String(s) }
          />
          <CirclePointer color={'red'} />
        </div>
      </div>
    );
  };
