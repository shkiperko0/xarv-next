import { createEventer } from "src/xarv/plain/utils/eventer";
import {
	CScriptNode,
	CNodeIO,
	CNodeConnection,
} from "../base";

export const nodeEventer = createEventer<{
	deselectNodes(): void;
	onAddNode(node: CScriptNode): void
	onRemoveNode(node: CScriptNode): void
	onNodeMove(node: CScriptNode): void
	onSelectNode(node: CScriptNode, is_selected: boolean): void
	onSelectIO(input: CNodeIO, is_selected: boolean): void
	onAddConnection(con: CNodeConnection): void
	onRemoveConnection(con: CNodeConnection): void
	onRefresh(): void
}>()

let selection: CScriptNode[] = [];
nodeEventer.subscribe("onSelectNode", (node, is_selected) => {
	if (is_selected) {
		selection.push(node);
	} else {
		selection = selection.filter((del) => del != node);
	}

	if (selection.length == 2) {
		const [a, b] = selection;
		if (a !== b) {
			const script = node.script!;
			const con = script.FindConnection(a, b);
			if (con !== undefined) {
				console.log("disconnected");
				script.Disconnect(a, b);
				{
					nodeEventer.trigger("onRemoveConnection", con);
					nodeEventer.trigger("onRefresh");
				}
			} else {
				console.log("connected");
				const con = script.Connect(selection[0], selection[1]);
				if (con) {
					nodeEventer.trigger("onAddConnection", con);
					nodeEventer.trigger("onRefresh");
				}
			}

			selection = [];
			nodeEventer.trigger("deselectNodes");
		}
	}
});