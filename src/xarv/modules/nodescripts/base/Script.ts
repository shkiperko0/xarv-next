import { structuredClone_JSON } from "src/xarv/plain/utils";
import { CNodeConnection, CNodeIOConnection } from "./Connection";
import { CScriptDisplay, defaultScriptDisplaySettings } from "./Display";
import { ScriptState } from "./Execution";
import { CScriptNode } from "./Node";
import { CNodeIO } from "./io";

export class CScript {
    next_id: number = 0
    start?: CScriptNode | undefined
    nodes: CScriptNode[] = []
    connections: CNodeConnection[] = []
    pipes: CNodeIOConnection[] = []
    display: CScriptDisplay = structuredClone_JSON(defaultScriptDisplaySettings)

    static CheckIsCircleConnection(a: CScriptNode, b: CScriptNode): boolean {
        let current = b.next;
        while (current) {
            if (current == a) return true;
            current = current.next;
        }
        return false;
    }
    
    FindConnection(a: CScriptNode, b: CScriptNode): CNodeConnection | undefined {
        for (const con of this.connections) {
            if ((con.from == a || con.to == a) && (con.from == b || con.to == b)) {
                return con;
            }
        }
        return undefined;
    }
    
    FindIOConnection(a: CNodeIO, b: CNodeIO): CNodeIOConnection | undefined {
        for (const con of this.pipes) {
            if ((con.from == a || con.to == a) && (con.from == b || con.to == b)) {
                return con;
            }
        }
        return undefined;
    }
    
    Connect(a: CScriptNode, b: CScriptNode): CNodeConnection | null {
        if (a.next || b.last || CScript.CheckIsCircleConnection(a, b)) return null;
    
        const connection: CNodeConnection = {
            id: this.next_id++, 
            from: a, 
            to: b
        }
        
        this.connections.push(connection);
        a.next = b;
        b.last = a;
        return connection;
    }
    
    Disconnect(a: CScriptNode, b: CScriptNode): void {
        const connection = this.FindConnection(a, b);
        if (connection) {
            if(connection.from) connection.from.next = undefined;
            if(connection.to) connection.to.last = undefined;
            this.connections = this.connections.filter((del) => del != connection);
        }
    }
    
    ConnectPipe(a: CNodeIO, b: CNodeIO): CNodeIOConnection | null {
        if (a.type == b.type) return null;
    
        if (a.type == "in" && b.type == "out") {
            return this.ConnectPipe(b, a);
        }
    
        const pipe: CNodeIOConnection = {
            id: this.next_id++,
            from: a,
            to: b
        }
    
        this.pipes.push(pipe);
        a.to = b.from;
        b.from = a.to;
        return pipe;
    }
    
    DisconnectPipe(a: CNodeIO, b: CNodeIO) {
        const pipe = this.FindIOConnection(a, b);
        if (pipe) {
            if(pipe.from) pipe.from.to = undefined;
            if(pipe.to) pipe.to.from = undefined;
            this.pipes = this.pipes.filter((del) => del != pipe);
        }
    }
    
    Exec(state: ScriptState): ScriptState {
        let current_node = this.start;
        let current_state = state;
        while (current_node) {
            current_state = current_node.Exec(current_state);
            const next_node = current_node.Route()
            if (next_node) {
                console.log("from", current_node.Base().Name, "to", next_node.Base().Name);
            }
            current_node = next_node;
        }
        return current_state;
    }

    AddNode(n: CScriptNode | CScriptNode[]){
        if(n instanceof Array){
            this.nodes.push(...n)
            n.forEach(n => {
                n.id = this.next_id++
                n.script = this
            })
        }else{
            this.nodes.push(n)
            n.id = this.next_id++
            n.script = this
        }
    }
}
