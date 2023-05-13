import { useEffect } from "react";
import { createEventer } from "../eventer";

type FieldNameType = string | number | symbol

type RPC_Handlers<T extends FieldNameType = any> = Record<T, { send?: any, recv?: any }>
type Event_Handlers<T extends FieldNameType = any> = Record<T, (...args: any) => void>

type IClient<
  RType extends RPC_Handlers,
  EType extends Event_Handlers
> = {
  callback_list: Record<FieldNameType, (...args: RType[keyof RType]['recv'] ) => void>
  callback_names_list: Record<FieldNameType, FieldNameType>
  rtype: {
    [name in keyof RType]: (...args: RType[name]['recv']) => void
  }
}

class Client<
  RType extends RPC_Handlers,
  EType extends Event_Handlers,
  CL extends IClient<RType, EType> = IClient<RType, EType>
>{
  is_connected: boolean = false
  await_list: string[] = []
  callback_list: CL['callback_list'] = {}
  callback_names_list: CL['callback_names_list'] = {}
  next_callback_index: number = 0
  eventer_rpc = createEventer<CL['rtype']>()
  eventer_events = createEventer<EType>()

  url: string
  ws: WebSocket

  constructor(url: string) {
    this.url = url
    this.ws = this.ws_Init();
  }

  private onMessage(msg: MessageEvent<any>) {
    type EventMessage = [string, any]
    type RPCMessage = [number, any, number | undefined | string]
    type MessageType = EventMessage | RPCMessage

    const response = JSON.parse(msg.data) as MessageType;
    if (typeof response[0] === 'number') {
      const [status, data, index] = response as RPCMessage;

      if (index === undefined) {
        console.log("unsubscribed #depredecated", status, data, index);
        return;
      }
      
      const callback = this.callback_list[index]
      let rpcname = this.callback_names_list[index]

      if (typeof index === 'string') {
        rpcname = index
        console.log("fake message", index, status, data);
      }

      if (callback) {
        callback(...[status, data] as any);
        if(typeof index == 'number') this.unsubscribe(index);
      }

      if (rpcname) {
        console.log("triggered", rpcname, status, data, index);
        this.eventer_rpc.trigger(rpcname, ...[status, data] as any);
      }

      return;
    }

    if (typeof response[0] === "string") {
      const [event, ...data] = response as EventMessage;
      this.eventer_events.trigger(event, ...data as any);
      return;
    }

    console.log('wtf')
  }

  private ws_Init() {
    const ws = new WebSocket(this.url);
    const client = this

    ws.onopen = function (this: WebSocket, ev: Event) {
      client.is_connected = true;
      client.send_awaited();
      console.log("New connection");
    }

    ws.onmessage = function (this: WebSocket, msg: MessageEvent<any>) {
      if(msg.data) client.onMessage(msg)
    }

    ws.onerror = function (this: WebSocket, ev: Event) {
      console.log("Connection error", ev);
    }

    ws.onclose = function (this: WebSocket) {
      client.is_connected = false;
      console.log("Connection closed");
      setTimeout(() => {
        client.ws = client.ws_Init()
      }, 1000);
    }

    return ws
  }

  unsubscribe(index: number) {
    delete this.callback_list[index];
    delete this.callback_names_list[index];
  }

  private send_awaited() {
    for (const message of this.await_list) {
      this.ws.send(message);
    }
    this.await_list = [];
  }

  fake_rpc<Key extends keyof RType>(name: Key, data: RType[Key]['recv']){
    const [status, ...other] = data
    this.onMessage({ data: JSON.stringify([status, other, name]) } as any)
  }

  fake_event<Key extends keyof EType>(name: Key, data: Parameters<EType[Key]>){
    this.onMessage({ data: JSON.stringify([name, data]) } as any)
  }

  send<
    Key extends keyof RType,
    Data extends RType[Key]['send'],
    Callback extends (...args: RType[Key]['recv']) => void
  >(name: Key, data: Data, callback?: Callback): number | void {
    const current_index = (this.next_callback_index++);
    const message = JSON.stringify([name, data, current_index]);

    if (this.is_connected) {
      this.ws.send(message);
    } else {
      this.await_list.push(message);
    }

    if (callback) {
      this.callback_list[current_index] = callback
    }
    this.callback_names_list[current_index] = name;
    return current_index;
  }

  send_promised<
    Key extends keyof RType,
    Data extends RType[Key]['send']
  >(name: Key, data: Data) {
    return new Promise<RType[Key]['recv']>((resolve, reject) => {
      try {
        this.send(name, data, (...params) => resolve(params))
      } catch (error) {
        reject(error)
      }
    })
  }
}

export function createClient<RType extends RPC_Handlers, EType extends Event_Handlers>(url: string){ return new Client<RType, EType>(url) }


export const useWSC_RPC = <RType extends RPC_Handlers, K extends keyof RType>(client: Client<RType, {}>, rpc: K, callback: (...args: RType[K]['recv']) => void ) => {
  useEffect(() => {    
      client.eventer_rpc.subscribe(rpc, callback)
      return () => client.eventer_rpc.unsubscribe(rpc, callback)
  }, [client, rpc, callback])
}

export const useWSC_Event = <EType extends Event_Handlers, K extends keyof EType>(client: Client<{}, EType>, event: K, callback: EType[K]) => {
  useEffect(() => {    
    client.eventer_events.subscribe(event, callback)
    return () => client.eventer_events.unsubscribe(event, callback)
}, [client, event, callback])
}