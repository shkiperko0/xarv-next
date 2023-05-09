import { useState } from "react"
import { CMathNode_Addition, CMathNode_Division, CMathNode_Multiplication, CMathNode_Subtraction, CScript, CScriptNode, CTestNode, CTestNodeField, ScriptState } from "./node-system"
import { GUI_NodePallete, GUI_Script } from "./node-system-gui"

const script = new CScript()
script.start = new CScriptNode(script, 'Start')
script.Connect(script.start, new CScriptNode(script, 'End'))

new CMathNode_Addition(script)
new CMathNode_Division(script)
new CMathNode_Multiplication(script)
new CMathNode_Subtraction(script)

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
        <input type="text" value={value} onChange={e=>setValue(e.currentTarget.value)}/>
        <br/>
        <GUI_NodePallete />
        <GUI_Script script={script} value={GetState()}/>
    </>
}

