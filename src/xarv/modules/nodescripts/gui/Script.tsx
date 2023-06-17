import { useState } from "react";
import { CNodeConnection, CScript, CScriptNode, CNodeIOConnection, ScriptState } from "../base";
import { useEventer } from "src/xarv/hooks";
import { nodeEventer as we, nodeGuiStyles as styles } from '.'
import { GUI_ScriptNode } from './ScriptNode'
import { GUI_Connection, GUI_PipeConnection } from './Connection'

interface GUI_ScriptProps {
	script: CScript;
	value?: ScriptState
}

export const GUI_Script = (props: GUI_ScriptProps) => {
	const { script } = props
	const { nodes, connections, pipes } = script

	const [state, setState] = useState<{ nodes: CScriptNode[], connections: CNodeConnection[], pipes: CNodeIOConnection[] }>(script);

	// useEventer(we, 'onNodeMove', node => { 
	// 	// do nothing, а вдруг понадобится
	// })

	useEventer(we, 'onAddNode', newItem => { 
		setState({ ...state, nodes: [...state.nodes, newItem] }) 
	})

	useEventer(we, 'onRemoveNode', oldItem => { 
		setState({ ...state, nodes: state.nodes.filter((del) => del != oldItem) }) 
	})

	useEventer(we, "onAddConnection", newItem => { 
		setState({ ...state, connections: [...state.connections, newItem] }) 
	})

	useEventer(we, "onRemoveConnection", oldItem => { 
		setState({ ...state, connections: state.connections.filter((del) => del != oldItem) }) 
	})

	return <div className={styles.script}>
		{
			nodes.map(
				node => <GUI_ScriptNode key={node.id} node={node} />
			)
		}{
			connections.map(
				connection => <GUI_Connection key={connection.id} connection={connection} />
			)
		}{
			pipes.map(
				pipe => <GUI_PipeConnection key={pipe.id} connection={pipe} />
			)
		}
	</div>
}