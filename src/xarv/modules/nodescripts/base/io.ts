import { CScriptNode } from "./Node";

type NodeIOType = "in" | "out";

export interface CNodeIO {
  type: NodeIOType;
  from?: CNodeValue;
  to?: CNodeValue;
  node: CScriptNode;
}

export interface CNodeValue<ValueType = any> {
  name: string;
  defaultValue?: ValueType;
  value?: ValueType;
  node: CScriptNode;
}