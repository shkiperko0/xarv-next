import { structuredClone_JSON } from "src/xarv/plain/utils";
import { nodeGuiStyles } from "../gui";
import { CScriptNodeDisplay, defaultScriptNodeDisplaySettings } from "./Display";
import { ScriptState } from "./Execution";
import { CScript } from "./Script";
import { CNodeIO, CNodeValue } from "./io";


export interface INodeEditorProps<Type extends CScriptNode = any>{
    node: Type
}

export interface CScriptNodeBase{
    Name: string
    Description?: string
    Editor?(props: INodeEditorProps): JSX.Element
    Type: NodeType 
    CssClass: string
}

export const NodeCSSClass = {
    event: nodeGuiStyles.eventNode, 
    normal: nodeGuiStyles.normalNode, 
    base: nodeGuiStyles.baseNode, 
} as const

export enum NodeType{
    normal,
    event,
    base
}

export class CScriptNode {
    static Name: string = 'CScriptNode'
    static Description?: string
    static Editor?(props: INodeEditorProps): JSX.Element
    static CssClass: string = NodeCSSClass.base
    static Type: NodeType = NodeType.base
    
    id?: number;
    script?: CScript;
    next?: CScriptNode
    last?: CScriptNode
    io: CNodeIO[] = [];
    values: CNodeValue[] = [];
    display: CScriptNodeDisplay = structuredClone_JSON(defaultScriptNodeDisplaySettings)

    Base(): CScriptNodeBase {
        return this.constructor as any as CScriptNodeBase
    }

    Route(): CScriptNode | undefined {
        return this.next
    }

    Exec(state: ScriptState): ScriptState {
        return state
    }

    Run(state: ScriptState): ScriptState {
        let current_node: CScriptNode | undefined = this;
        let current_state = state;
        while (current_node) {
            current_state = current_node.Exec(current_state);
            const next_node = current_node.Route()
            if (next_node) {
                console.log("from", current_node.Base().Name, "to", next_node.Base().Name);
            }
            current_node = next_node;
        }
        return current_state;
    }
}
export class CScriptNodeNormal extends CScriptNode {
    static Name: string = 'CScriptNodeNormal'
    static Description?: string
    static Editor?(props: INodeEditorProps): JSX.Element
    static CssClass: string = NodeCSSClass.normal
    static Type: NodeType = NodeType.normal
}

export class CScriptNodeEvent extends CScriptNode {
    static Name: string = 'CScriptNodeEvent'
    static Description?: string;
    static Editor?(props: INodeEditorProps): JSX.Element;
    static CssClass: string = NodeCSSClass.event
    static Type: NodeType = NodeType.event
}
