import { useState } from "react";
import { CScript, CScriptNode } from "../base";
import { CMathNode_Addition, CMathNode_Division, CMathNode_Multiplication, CMathNode_Subtraction } from "../nodes/MathNodes";
import { CObjectFieldEditor } from "../nodes/ObjectFieldEditor";
import { GUI_NodePallete } from "./NodePallete";
import { GUI_ScriptEditor } from "./ScriptEditor";

const script = new CScript()

const node = new CScriptNode()

const node1 = new CObjectFieldEditor()
const node2 = new CObjectFieldEditor()
const node3 = new CObjectFieldEditor()
const node4 = new CObjectFieldEditor()

const add_node = new CMathNode_Addition();
const div_node = new CMathNode_Division();
const mul_node = new CMathNode_Multiplication();
const sub_node = new CMathNode_Subtraction();

script.AddNode([node, node1, node2, node3, node4, add_node, div_node, mul_node, sub_node])
script.start = node;

export const ScriptTestComponent = () => {
	const [windowedPallete, toggle_windowedPallete] = useState<true>()
	const [enablePallete, toggle_enablePallete] = useState<true>()

	return <>
		<button onClick={() => toggle_windowedPallete(e => e === true ? undefined : true) }>
			windowedPallete {windowedPallete ? 'enabled' : 'disabled'}
		</button>

		<button onClick={() => toggle_enablePallete(e => e === true ? undefined : true) }>
			enablePallete {enablePallete ? 'enabled' : 'disabled'}
		</button>
		
		<GUI_ScriptEditor enablePallete={enablePallete} windowedPallete={windowedPallete} script={script} />
	</>
}
