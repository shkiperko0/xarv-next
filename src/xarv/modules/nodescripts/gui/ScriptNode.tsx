import { CSSProperties, useRef, useState } from "react"
import { CScriptNode } from "../base"
import { useDragMovement, useEventer, useHtmlElementEvent } from "src/xarv/hooks"
import { nodeEventer as we, nodeGuiStyles as styles } from '.'

import { CirclePointer } from "./common"
import { IPoint } from "src/xarv/plain/types"
import { cl } from "src/xarv/plain/utils"
import { useScriptEditor } from "./ScriptEditor"
import { NonControllDragAllower, ItemInnerBounder, RefDragAllower } from "src/xarv/hooks/useDragMovement"
import { forwardRefObject } from "src/xarv/plain/react"

interface GUI_ScriptNodeLabelProps extends GUI_ScriptNodeProps {
	inmove?: IPoint
}

const useRefresh = () => {
	const [ _, set ] = useState({})
	return () => set({})
}

export const GUI_ScriptNode_Label = forwardRefObject<HTMLDivElement, GUI_ScriptNodeLabelProps>(
	function GUI_ScriptNode_Label(props, ref){
		const { node, inmove } = props
		const { Description: description, Name: name } = node.Base()

		let style = inmove && {
			left: inmove.x,
			top: inmove.y,
			position: 'absolute',
			zIndex: 1000,
		} as CSSProperties 

		return <>
			<div style={style} ref={ref} className={cl(styles.nodeInPallete, node.Base().CssClass)}>
				<div className={cl(styles.nodeCaption)}>
					<span>{name}</span>
					{" "}
					{
						description &&
						<span style={{ float: "right" }} title={description}>(?)</span>
					}
				</div>
			</div>
		</>
	}
)

export const GUI_ScriptNode_PaletePlaceholder = (props: GUI_ScriptNodeProps) => {
	const ref = useRef<HTMLDivElement>(null);
	const [pos, setPos] = useState<IPoint | undefined>()

	const { dp } = useDragMovement(ref, {
		dragger: ({ pos, event, type }) => {
			if (type === 'moveend') {
				props.onMoveEnd && props.onMoveEnd(event)
				setPos(undefined)
			}else{
				setPos(pos)
			}
		},
		allowHandler: NonControllDragAllower
	})

	return <div style={{ position: 'relative' }}>
		{ <GUI_ScriptNode_Label ref={ref} {...props} inmove={pos} /> }
		{ dp && <GUI_ScriptNode_Label {...props}/> }
	</div>
}

interface GUI_ScriptNodeProps {
	node: CScriptNode
	onMoveEnd?(event: MouseEvent): void
}

export const GUI_ScriptNode = (props: GUI_ScriptNodeProps) => {
	const { node } = props
	const { posX, posY } = node.display

	const { frameRef } = useScriptEditor()

	const ref_body = useRef<HTMLDivElement>(null);
	const ref_caption = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState(false);
	const { Editor, Name, Description } = node.Base()
	//const refresh = useRefresh()

	const { dp } = useDragMovement(ref_body, {
		dragger: ({ pos, event, type }) => {
			if (type === 'moveend') props.onMoveEnd && props.onMoveEnd(event)

			node.display = {
				posX: pos.x,
				posY: pos.y,
			} 

			console.log(node.display)

			we.trigger("onNodeMove", node);
			//refresh();
		},
		bounder: ItemInnerBounder(frameRef, ref_body),
		allowHandler: RefDragAllower(ref_caption)
	})

	useEventer(we, "deselectNodes", () => setSelected(false));

	useHtmlElementEvent(ref_body, "dblclick", (event) => {
		setSelected(!selected);
		we.trigger("onSelectNode", node, !selected);
	});

	return <>
		<div
			ref={ref_body}
			className={cl(styles.node, node.Base().CssClass)}
			style={{
				left: posX,
				top: posY,
				position: 'absolute',
				display: 'flex',
				flexDirection: 'column'
			}}
		>
			<div ref={ref_caption}
				className={cl(styles.nodeCaption)}

				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',
					borderTopLeftRadius: '5px',
					borderTopRightRadius: '5px',
					padding: 5,
					alignItems: 'center',
					cursor: dp ? 'grabbing' : 'grab',
					backgroundColor: dp ? 'gra' : 'grabbing' 
				}}
			>
				<span unselectable="on">{Name}</span>
				{ 
					Description && 
					<>
						<span style={{margin: '0 10px'}}/>
						<span title={Description}>(?)</span>
					</> 
				}
			</div>
			<div style={{
				backgroundColor: selected ? 'lightgreen' : 'lightblue',
				display: 'flex',
				flexDirection: 'column'
			}}>
				<div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
					<CirclePointer color={node.last ? "white" : "black"} /* ON */ /> 
					<CirclePointer color={node.next ? "white" : "black"} /* OFF */ /> 
				</div>
				{ Editor && <Editor node={node} /> }
			</div>
		</div>
	</>
};