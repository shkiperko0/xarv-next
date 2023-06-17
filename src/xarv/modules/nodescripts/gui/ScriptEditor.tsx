import { createContext, useContext, useRef, useState } from "react";
import { CScript, ScriptState } from "../base"
import { nodeGuiStyles as styles } from '.'
import { GUI_NodePallete } from "./NodePallete";
import { GUI_ScriptFrame } from "./ScriptFrame";

interface IScriptEditorCore{
	script?: CScript
}

const useScriptEditorCore = (options: IScriptEditorCore) => {
	const [raw_value, setRawValue] = useState<string | undefined>("{}");

	const [script, setScript] = useState(options.script)
	const frameRef = useRef<HTMLDivElement>(null)
	const pelleteRef = useRef<HTMLDivElement>(null)

	const GetState = (): ScriptState => {
		try {
			return raw_value ? JSON.parse(raw_value) : {};
		} catch (error) {
			return {};
		}
	};

	return { frameRef, pelleteRef, script, setScript, setRawValue, getStateObject: GetState, raw_value }
}

type IScriptEditor = ReturnType<typeof useScriptEditorCore>
const ScriptEditorContext = createContext<IScriptEditor>(null as any)
export const useScriptEditor = () => useContext(ScriptEditorContext)

interface GUI_ScriptEditorProps {
	enablePallete?: true
	script?: CScript
}

export function GUI_ScriptEditor({ enablePallete, script }: GUI_ScriptEditorProps) {
	const editor = useScriptEditorCore({script})
	return <ScriptEditorContext.Provider value={editor}>
		<div className={styles.scriptEditor}>
			{enablePallete && <GUI_NodePallete ref={editor.pelleteRef} />}
			<GUI_ScriptFrame ref={editor.frameRef} script={script} />
		</div>
	</ScriptEditorContext.Provider>
}