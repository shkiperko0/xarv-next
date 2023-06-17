import { CSSProperties, useRef, useState } from "react";
import { CScript, CScriptDisplay, ScriptState, defaultScriptDisplaySettings } from "../base";
import { useDragMovement } from '../../../hooks'
import { nodeGuiStyles as styles } from ".";
import { GUI_Script } from "./Script";
import { defaultScriptFrameSize } from "../base/Display";
import { ItemOuterBounder } from "src/xarv/hooks/useDragMovement";
import { forwardRefObject } from "src/xarv/plain/react";

interface GUI_ScriptFrameProps {
	script?: CScript;
	value?: ScriptState
}

export const GUI_ScriptFrame = forwardRefObject<HTMLDivElement, GUI_ScriptFrameProps>(
	function GUI_ScriptFrame(props: GUI_ScriptFrameProps, frameRef){
		const { script, value } = props;
		const holderRef = useRef<HTMLDivElement>(null)
		const [display, setDisplay] = useState<CScriptDisplay>(defaultScriptDisplaySettings)

		const { dp: grabbed } = useDragMovement(frameRef, { 
			dragger: ({ pos }) => {
				setDisplay({
					...display,
					offsetY: pos.y,
					offsetX: pos.x,
				})
			},
			bounder: ItemOuterBounder(holderRef, frameRef)
		})

		const style: CSSProperties = {
			minHeight: defaultScriptFrameSize.height,
			minWidth: defaultScriptFrameSize.width,
			left: `${display.offsetX}px`,
			top: `${display.offsetY}px`,
			transform: `scale(${display.scale})`,
			cursor: grabbed ? 'move' : 'crosshair'
		}

		return <>
			<div ref={holderRef} className={styles.scriptFrameWrapper}>
				<div ref={frameRef} className={styles.scriptFrame} style={style}>
					{script && <GUI_Script script={script} value={value} />}
				</div>
			</div>
		</>
	}
)