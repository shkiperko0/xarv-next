import { CScriptNode } from "./Node";
import { CNodeIO } from "./io";

export interface CConnection<Type>{
    id?: number;
    from?: Type;
    to?: Type;
}

export type CNodeConnection = CConnection<CScriptNode>
export type CNodeIOConnection = CConnection<CNodeIO>
