import { createEventer } from "../eventer";

type FieldNameType = string | number | symbol

type Handlers<T extends FieldNameType = any, R extends Array<any> = Array<any>> = Record<T, (...args: any) => R>
type Events<T extends FieldNameType = any> = Record<T, (...args: any) => void>

type W = {
  [name: FieldNameType]: (...args: any[]) => any[]
}

type RPCs<A extends W> = {
  [K in keyof A]: (...args: ReturnType<A[K]>) => void
}

class WSRPCClient<
  RType extends Handlers,
  EType extends Events
>{
  is_connected: boolean = false
  await_list: string[] = []
  callback_list: Record<string, (...args: ReturnType<RType[keyof RType]>) => void> = {}
  callback_names_list: Record<string, FieldNameType> = {}
  next_callback_index: number = 0
  eventer_rpc = createEventer<RPCs<RType>>()
  eventer_events = createEventer<EType>()

  url: string
  ws: WebSocket

  constructor(url: string) {
    this.url = url
    this.ws = this.ws_Init();
  }

  private onMessage(msg: MessageEvent<any>) {
    type EventMessage = [string, any]
    type RPCMessage = [number, any, number | undefined]
    type MessageType = EventMessage | RPCMessage

    const response = JSON.parse(msg.data) as MessageType;

    if (typeof response[0] === 'number') {
      const [status, data, index] = response as RPCMessage;

      if (index === undefined) {
        console.log("unsubscribed #depredecated", status, data, index);
        return;
      }

      const callback = this.callback_list[index]
      const rpcname = this.callback_names_list[index]

      if (callback) {
        callback(...[status, data] as any);
        this.unsubscribe(index);
      }

      if (rpcname) {
        this.eventer_rpc.trigger(rpcname, ...response as any);
      }

      return;
    }

    if (typeof response[0] === "string") {
      const [event, data] = response as EventMessage;
      this.eventer_events.trigger(event, ...data);
      return;
    }

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
      client.onMessage(msg)
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

  send<
    Key extends keyof RType,
    Data extends Parameters<RType[Key]>,
    Callback extends (...args: ReturnType<RType[Key]>) => void
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
      this.callback_names_list[current_index] = name;
    }
    return current_index;
  }

  send_promised<
    Key extends keyof RType,
    Data extends Parameters<RType[Key]>
  >(name: Key, data: Data) {
    return new Promise<ReturnType<RType[Key]>>((resolve, reject) => {
      try {
        this.send(name, data, (...params) => resolve(params))
      } catch (error) {
        reject(error)
      }
    })
  }
}

export function createClient<RType extends Handlers, EType extends Events>(url: string){ return new WSRPCClient<RType, EType>(url) }
