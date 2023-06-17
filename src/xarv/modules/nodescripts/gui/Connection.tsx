import { useState } from "react";
import { CNodeConnection, CNodeIOConnection } from "../base";
import { useEventer } from "src/xarv/hooks";
import { nodeGuiStyles as styles, nodeEventer as we } from '.'

import { pos2point } from "../base/Display";
import { cl } from "src/xarv/plain/utils";

export const GUI_PipeConnection = (props: { connection: CNodeIOConnection }) => {
	const { connection: { from, to } } = props;

	const [state, setState] = useState({ display_a: from!.node.display, display_b: to!.node.display });
	const { display_a, display_b } = state

	useEventer(we, "onNodeMove", (node) => {
		if(from && to){
			if (node == from.node || node == to.node) {
				setState({ display_a: from.node.display, display_b: to.node.display, });
			}
		}
	});

	const pos_a = pos2point(display_a)
	const pos_b = pos2point(display_b)
	
	return (
		<div className={`${cl(styles.connection)}  `}>
			<svg className={cl(styles.connectionLine)}>
				<path className={cl(styles.connectionPath)} 
					d={["M", pos_a.x, pos_a.y, pos_b.x, pos_b.y].join(" ")} 
				/>
			</svg>
		</div>
	);
};

export const GUI_Connection = (props: { connection: CNodeConnection }) => {
	const { connection: { from, to } } = props;

	const [state, setState] = useState({ display_a: from!.display, display_b: to!.display });
	const { display_a, display_b } = state

	useEventer(we, "onNodeMove", (node) => {
		if(from && to){
			if (node == from || node == to) {
				setState({ display_a: from.display, display_b: to.display });
			}
		}
	});

	const pos_a = pos2point(display_a)
	const pos_b = pos2point(display_b)

	return (
		<div className={`${cl(styles.connection)}  `}>
			<svg className={cl(styles.connectionLine)}>
				<path className={cl(styles.connectionPath)} 
					d={["M", pos_a.x, pos_a.y, pos_b.x, pos_b.y].join(" ")} 
				/>
			</svg>
		</div>
	);
};