import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CScript, ScriptState } from "../base"
import { nodeGuiStyles as styles } from '.'
import { GUI_NodePallete } from "./NodePallete";
import { GUI_ScriptFrame } from "./ScriptFrame";
import { useWindows } from "../../taskmanager";

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
	windowed?: true
	script?: CScript
}

export function GUI_ScriptEditor({ enablePallete, script, windowed }: GUI_ScriptEditorProps) {
	const editor = useScriptEditorCore({script})
	const windows = useWindows()

	useEffect(() => {
		if(windowed && enablePallete){
			const id = windows.open({
				title: 'Node pallete',
				Render: () => <>
					<ScriptEditorContext.Provider value={editor}>
						<GUI_NodePallete ref={editor.pelleteRef} />
					</ScriptEditorContext.Provider>
				</>,
			})
			return () => {
				windows.close(id)
			}
		}

		return
	}, [windowed, enablePallete])


	return <ScriptEditorContext.Provider value={editor}>
		<div className={styles.scriptEditor}>
			{(enablePallete && !windowed) && <><span>Pallete</span><GUI_NodePallete ref={editor.pelleteRef} /> </>}
			<GUI_ScriptFrame ref={editor.frameRef} script={script} />
		</div>
	</ScriptEditorContext.Provider>
}