import { useState } from "react"
import { CFunctionNode, CScript, CScriptNode, CTestNode, CTestNodeField, ScriptState } from "./node-system"
import { GUI_NodePallete, GUI_Script } from "./node-system-gui"

const script = new CScript()
script.start = new CScriptNode(script, 'Start')
script.Connect(script.start, new CScriptNode(script, 'End'))

new CFunctionNode(script,(state, node) => {
    return { ...state, value: state.value + node.value }
}, 'add node')

new CFunctionNode(script, (state, node) => {
    return { ...state, value: state.value / node.value }
}, 'div node')

new CFunctionNode(script, (state, node) => {
    return { ...state, value: state.value - node.value }
}, 'sub node')

new CFunctionNode(script, (state, node) => {
    return { ...state, value: state.value * node.value }
}, 'mul node')

new CTestNodeField(script)
new CTestNodeField(script)
new CTestNodeField(script)

export const ScriptTestComponent = () => {
    const [ value, setValue ] = useState<string | undefined>('{}')

    const GetState = (): ScriptState => {
        try{
            return value ? JSON.parse(value) : {}
        }
        catch(error){
            return {}
        }
    }

    return <>
        <input 
            type="text" 
            value={value} 
            onChange={e=>setValue(e.currentTarget.value)}
        />
        <br/>
        <GUI_NodePallete />
        <GUI_Script script={script} value={GetState()}/>
    </>
}

