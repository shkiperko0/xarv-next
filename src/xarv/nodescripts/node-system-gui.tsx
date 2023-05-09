
import { createEventer, useEventer } from 'xarv/eventer/eventer'
import { IScript, IConnection, IScriptNode, ScriptState, CTestNodeField, CFunctionNode, CTestNode, DisplaySettings_ScriptNode, CScriptNode } from './node-system'
import style from './node-system-gui.module.scss'
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef, useState } from 'react'
import { useDragMovement, useHtmlElementEvent } from 'xarv/tools/hooks'
import { cl } from 'xarv/tools/tools'

const we = createEventer<{
    deselectNodes(): void
    onNodeMove(node: IScriptNode): void
    onSelectNode(node: IScriptNode, is_selected: boolean): void
    onAddConnection(con: IConnection): void
    onRemoveConnection(con: IConnection): void
    onRefresh(): void
}>()

interface DisplaySettings_Script{
    scale: number,
    offsetX: number
    offsetY: number
}

type CildrenProps = { children?: ReactNode }

type NodeConstructor = (script: IScript, display: DisplaySettings_ScriptNode) => IScriptNode
type INodePallete = NodeConstructor[]

const nodePallete: INodePallete = [
    (script, display) => {
        const node = new CTestNodeField(script)
        node.display = display
        return node
    }, 

    (script, display) => {
        const node = new CFunctionNode(script, (state, node) => { return state })
        node.display = display
        return node
    }, 

    (script, display) => {
        const node = new CTestNode(script)
        node.display = display
        return node
    }, 
]

export const GUI_NodePallete = () => {
    return <div>


    </div>
}

export const GUI_Script = (props: { script: IScript, value?: ScriptState } & CildrenProps) => {
    const { script, children, value } = props
    const [ state, setState ] = useState({ nodes: script.nodes, connections: script.connections })
    const { connections, nodes } = state
    const [ result, setResult ] = useState<ScriptState>({})

    useEventer(we, 'onAddConnection', con => setState({ nodes, connections: [...connections, con] }))
    useEventer(we, 'onRemoveConnection', con => setState({ nodes, connections: connections.filter(del => del != con) }))
    useEventer(we, 'onRefresh', () => setResult(script.Exec(value ?? {})))

    useEffect(() => {
        setResult(script.Exec(value ?? {}))
    }, [script, connections, nodes, value])

    return <div className={cl(style.script)}>
        {JSON.stringify(result)}
        {nodes.map(node => <GUI_ScriptNode key={node.id} node={node} />)}
        {children}
        {connections.map(connection => <GUI_Connection key={connection.id} connection={connection} />)}
    </div>
}

let selection: IScriptNode[] = []
we.subscribe_event('onSelectNode', (node, is_selected) => {
    if(is_selected){
        selection.push(node)
    }else{
        selection = selection.filter(del => del != node)
    }

    if(selection.length == 2){
        const [a,b] = selection
        if(a !== b){
            const { script }= node
            const con = script.FindConnection(a, b)
            if(con !== undefined){
                console.log('disconnected');
                script.Disconnect(a, b)
                we.trigger_event('onRemoveConnection', con)
            }else{
                console.log('connected');
                const con = node.script.Connect(selection[0], selection[1])
                we.trigger_event('onAddConnection', con)
            }

            selection = []
            we.trigger_event('deselectNodes')
        }
    }

})

export const GUI_ConnectionPoint = (props: { 
    type: 'left' | 'right'
    index: number
}) => {

    return <>
    </>
}

export const GUI_ScriptNode = (props: { node: IScriptNode }) => {
    const { node } = props
    const { posX, posY, ...other } = node.display as DisplaySettings_ScriptNode ?? {}
    const ref = useRef<HTMLDivElement | null>(null)
    const [ selected, setSelected ] = useState(false)
    const { Editor } = node.constructor as any

    useDragMovement(ref, ({x: posX, y: posY}) => {
        node.display = { ...other, posX, posY }
        we.trigger_event('onNodeMove', node)
    })

    useEventer(we, 'deselectNodes', () => setSelected(false))

    useHtmlElementEvent(ref, 'dblclick', event => {
        setSelected(!selected)
        console.log(event);
        we.trigger_event('onSelectNode', node, !selected)
    })

    return <div ref={ref} className={cl(style.node)} 
        style={{ 
            left: posX, 
            top: posY, 
            backgroundColor: selected ? 'green' : 'red',
            position: node.display ? 'absolute' : undefined
        }}
    >
        {node.title}
        <br />
        { 
            Editor && <div 

            >
                <Editor node={node} /> 
            </div>
        }
    </div>
    
}

export const GUI_Connection = (props: { connection: IConnection }) => {
    const { connection: { from: a, to: b  } } = props
    const [ state, setState ] = useState({ 
        di_a: a.display as DisplaySettings_ScriptNode ?? {},
        di_b: b.display as DisplaySettings_ScriptNode ?? {}
    })
    const { di_a, di_b } = state

    useEventer(we, 'onNodeMove', node => {
        if(node == a || node == b){
            setState({ 
                di_a: a.display as DisplaySettings_ScriptNode ?? {},
                di_b: b.display as DisplaySettings_ScriptNode ?? {}
            })
        }
    })

    return <div className={cl(style.connection)}>
        <svg className={cl(style['connection-line'])}>
            <path className={cl(style['connection-path'])} d={`M ${di_a.posX} ${di_a.posY} ${di_b.posX} ${di_b.posY}`}/>
        </svg>
    </div>
}

interface StateProps<StateType>{
    state: [StateType, Dispatch<SetStateAction<StateType>>]
    format: (_: StateType) => string
    parse: (_: string) => StateType
    onChange?: (newState: StateType, lastState: StateType) => void
}

function StateInput<StateType>(props: StateProps<StateType>){
    const { format, state, parse, onChange } = props
    const [ value, setValue ] = state
    return <input type="text" value={format(value)} onChange={e => { 
        const n = parse(e.target.value) 
        setValue(n) 
        onChange && onChange(n, value)
    }} />
}

type TNodeProps<NodeClass> = {
    node: NodeClass
}

type NodeEditorRender<NodeClass = CScriptNode> = (props: TNodeProps<NodeClass>) => JSX.Element

type TNodeEditorRegister<T = any> = {
    [name: string]: NodeEditorRender<T>
}

const Editor_CTestNodeField = (props: TNodeProps<CTestNodeField>) => {
    const keyNameState = useState(props.node.keyName)
    const valueState = useState(props.node.value)

    return <div>
        <StateInput<string | null> state={keyNameState}
            onChange={nvalue => { 
                props.node.keyName = nvalue 
                we.trigger_event('onRefresh')
            }} 
            parse={ s => s ? String(s) : null }
            format={ s => String(s) }
        />
        <br />
        <StateInput<string | null> state={valueState}
            onChange={nvalue => { 
                props.node.value = nvalue
                we.trigger_event('onRefresh') 
            }} 
            parse={ s => s ? String(s) : null }
            format={ s => String(s) }
        />
    </div>
}

const Editor_CFunctionNode = (props: TNodeProps<CFunctionNode>) => {
    const [value, setValue] = useState(props.node.value)

    return <div>
        <input value={value} 
            onChange={e => { 
                const nvalue = Number(e.currentTarget.value)
                setValue(nvalue) 
                props.node.value = nvalue  
            }} 
            type="text" 
        />
    </div>
}

const nodeEditorsRegister: TNodeEditorRegister = {
    CTestNodeField: Editor_CTestNodeField,
    CFunctionNode: Editor_CFunctionNode
} 


