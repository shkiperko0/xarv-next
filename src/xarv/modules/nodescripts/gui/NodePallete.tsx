import { CScriptNode } from "../base";
import { CMathNode_Addition, CMathNode_Division, CMathNode_Multiplication, CMathNode_Subtraction, CObjectFieldEditor } from "../nodes";
import { nodeEventer, nodeGuiStyles as styles } from '.'
import { useMemo } from "react";
import { GUI_ScriptNode_PaletePlaceholder } from "./ScriptNode";
import { useScriptEditor } from "./ScriptEditor";
import { CScriptExecutionNode } from "../nodes/ScriptExecutionNode";
import { forwardRefObject } from "src/xarv/plain/react";

type CNodePallete = typeof CScriptNode[];
const nodePallete: CNodePallete = [CScriptExecutionNode, CMathNode_Addition, CMathNode_Division, CMathNode_Multiplication, CMathNode_Subtraction, CObjectFieldEditor];


interface GUI_NodePalleteProps {

}

export const GUI_NodePallete = forwardRefObject<HTMLDivElement, GUI_NodePalleteProps>(
    function GUI_NodePallete(props, ref){
        const editor = useScriptEditor()
        const row = useMemo(() => nodePallete.map(constructor => ([new constructor, constructor] as [CScriptNode, typeof CScriptNode])), [])

        return <div ref={ref} className={styles.nodePallete}>
            {
                row.map(
                    ([node, constructor]) => <GUI_ScriptNode_PaletePlaceholder
                        key={constructor.Name}
                        node={node}
                        onMoveEnd={event => {
                            if (editor.frameRef.current === null) return
                            const { current: frame } = editor.frameRef
                            const { pageX, pageY } = event
                            const rect = frame.getBoundingClientRect()
                            const node = new constructor
                            node.display.posX = pageX - rect.x
                            node.display.posY = pageY - rect.y
                            editor.script!.AddNode(node)
                            nodeEventer.trigger('onAddNode', node)
                            // alert('add node ' + node.Base().Name)
                        }}
                    />
                )
            }
        </div>
    }
)