import { useRef, useState, Dispatch, SetStateAction } from "react"

export interface IScript{
    display: any

    next_id: number
    start?: IScriptNode
    nodes: IScriptNode[]
    connections: IConnection[]

    FindConnection(a: IScriptNode, b: IScriptNode): IConnection | undefined
    Connect(a: IScriptNode, b: IScriptNode): IConnection
    Disconnect(a: IScriptNode, b: IScriptNode): void
    Exec(state: ScriptState): ScriptState
}

export interface IConnection{
    display: any

    id: number
    from: IScriptNode
    to: IScriptNode
}

export class CConnection implements IConnection {
    display: any

    id: number
    from: IScriptNode
    to: IScriptNode
    
    constructor(id: number, a: IScriptNode, b: IScriptNode){
        this.from = a
        this.to = b
        this.id = id
    }
}

export class CScript implements IScript{
    display: any

    next_id: number = 0
    start?: IScriptNode | undefined
    nodes: IScriptNode[] = []
    connections: IConnection[] = []

    constructor(){}

    FindConnection(a: IScriptNode, b: IScriptNode): IConnection | undefined {
        for(const con of this.connections){
            if((con.from == a || con.to == a) && (con.from == b || con.to == b)){
                return con
            }
        }
        return undefined
    }

    Connect(a: IScriptNode, b: IScriptNode): IConnection {
        const connection = new CConnection(this.next_id++, a, b)
        this.connections.push(connection)
        a.next = b
        return connection
    }

    Disconnect(a: IScriptNode, b: IScriptNode): void {
        const connected_with = this.FindConnection(a, b)
        if(connected_with){
            connected_with.from.next = undefined
            this.connections = this.connections.filter(del => del != connected_with)
        }
    }

    Exec(state: ScriptState): ScriptState {
        let current_node = this.start
        let current_state = state
        while(current_node){
          current_state = current_node.Exec(current_state)
          current_node = current_node.Route()
        }
        return current_state
    }
}

export type ScriptState = { [name: string]: any }
export type NodeFunction<NodeType> = (state: ScriptState, node: NodeType) => ScriptState

export interface INodeInput<ValueType=any>{
    name: string
    type: 'in' | 'out' | 'both'
    defaultValue?: ValueType
    value?: ValueType

    from?: INodeInput
    to?: INodeInput
    node: IScriptNode
}

export type IScriptNode = CScriptNode

export interface DisplaySettings_ScriptNode{
    posX: number
    posY: number
}

export class CScriptNode {
    static Editor?(props: { node: IScriptNode }): JSX.Element
    static description?: string

    display?: DisplaySettings_ScriptNode

    id: number
    title: string
    script: IScript
    next?: IScriptNode
    io: INodeInput<any>[] = []

    constructor(script: IScript, name?: string){
        this.id = script.next_id++
        this.script = script
        this.title = `${name ?? this.constructor.name} #${this.id}`
        script.nodes.push(this)
    }
    
    Exec(state: ScriptState): ScriptState {
        return state
    }
    
    Route(): IScriptNode | undefined {
        return this.next
    }
}

export class CFunctionNode extends CScriptNode { 

    value: number = 0
    func: NodeFunction<CFunctionNode>

    constructor(script: IScript, func: NodeFunction<CFunctionNode>, name?: string){
        super(script, name)
        this.func = func
        this.io = [
            { name: 'state', type: 'both', node: this }
        ]
    }

    Exec(state: ScriptState): ScriptState {
        return this.func(state, this)
    }
}

export class CTestNode extends CScriptNode { 

    constructor(script: IScript, name?: string){
        super(script, name)
        this.io = [
            { name: 'kekwo', type: 'in', node: this }
        ]
    }

    Exec(state: ScriptState): ScriptState{
        return { ...state, 'kekwo': 'yes' }
    }
}

export class CTestNodeField extends CScriptNode { 
    
    keyName: string | null = null
    value: string | null = null

    constructor(script: IScript, name?: string){
        super(script, name)
        this.io = [
            { name: 'kekwo', type: 'in', node: this }
        ]
    }

    Exec(state: ScriptState): ScriptState{
        return { ...state, ...(this.keyName ? {[this.keyName]: this.value}  : {}) }
    }
}




