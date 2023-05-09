

type WSCallback<ParamsType extends any> = (...args: ParamsType[]) => void
//type WSRPC_Callback<DataType=any> = (status: number, data: DataType) => void
//type WSEvent_Callback<DataType=any> = (data: DataType) => void

type WSRegister = {
  //[name: string]: WSCallback
  a1: (_: 1 | 2) => void
  a2: (_: 'a' | 'b') => ({ _: 'c' | 'd' })
}


interface ICallbackRPCNamesList {
  [index: string]: string | number | symbol;
}

interface IClient_WSRPC<
  TypeRPC extends WSRegister = WSRegister, 
  TypeEvent extends WSRegister = WSRegister,
  KeyRPC extends keyof TypeRPC = keyof TypeRPC, 
  ParamsRPC extends Parameters<TypeRPC[KeyRPC]> = Parameters<TypeRPC[KeyRPC]>, 
  RPCCallbackType extends WSCallback<ReturnType<TypeRPC[KeyRPC]>> = WSCallback<ReturnType<TypeRPC[KeyRPC]>>,
  RPCCallbackList extends { [index in KeyRPC]?: RPCCallbackType } = { [index in KeyRPC]?: RPCCallbackType  }
> {
  is_connected: boolean
  await_list: string[]
  callback_list: RPCCallbackList
  callback_names_list: ICallbackRPCNamesList
  next_callback_index: number

  send(rpcName: KeyRPC, rpcData: ParamsRPC, rpcCallback?: RPCCallbackType) : number | void

  unsubscribe(rpcIndex: number): void
  send_awaited(): void
}

class CClient_WSRPC<
  TypeRPC extends WSRegister = WSRegister, 
  TypeEvent extends WSRegister = WSRegister,
  KeyRPC extends keyof TypeRPC = keyof TypeRPC, 
  ParamsRPC extends Parameters<TypeRPC[KeyRPC]> = Parameters<TypeRPC[KeyRPC]>, 
  RPCCallbackType extends WSCallback<ReturnType<TypeRPC[KeyRPC]>> = WSCallback<ReturnType<TypeRPC[KeyRPC]>>,
  RPCCallbackList extends { [index in KeyRPC]?: RPCCallbackType } = { [index in KeyRPC]?: RPCCallbackType  }
> implements IClient_WSRPC<
  TypeRPC, TypeEvent, KeyRPC, ParamsRPC, RPCCallbackType
> {
  is_connected: boolean = false
  await_list: string[] = []
  callback_list: RPCCallbackList = {}
  callback_names_list: ICallbackRPCNamesList = {}
  next_callback_index: number = 0

  constructor(url: string){

  }

  send(rpcName: KeyRPC, rpcData: ParamsRPC, rpcCallback?: RPCCallbackType): number | void {
    const current_index = (this.next_callback_index++);
    const message = JSON.stringify([rpcName, rpcData, current_index]);

    if (this.is_connected) {
      server_ws.send(message);
    } else {
      this.await_list.push(message);
    }

    if(rpcCallback){
      this.callback_list[current_index] = rpcCallback
      this.callback_names_list[current_index] = rpcName;
    }
    return current_index;
  }

  unsubscribe(rpcIndex: number): void {
    throw new Error("Method not implemented.");
  }

  send_awaited(): void {
    throw new Error("Method not implemented.");
  }
}

const CreateClient = <TypeRPC extends WSRegister, TypeEvent extends WSRegister>(url: string): IClient_WSRPC<TypeRPC, TypeEvent> => {
  return new CClient_WSRPC<TypeRPC, TypeEvent>(url)
}

let server_ws: WebSocket;



const a: IClient_WSRPC = null as any
a.send('a2', ['b'], (data) => {})

const server: IServer<{}, {}> = {
  is_connected: false,
  rpc_await_send: [],
  rpc_callback_list: {},
  rpc_callback_names: {},
  rpc_callback_index: 0,

  unsubscribe(rpcIndex) {
    delete this.rpc_callback_list[rpcIndex];
    delete this.rpc_callback_names[rpcIndex];
  },

  send_awaited() {
    for (const message of this.rpc_await_send) server_ws.send(message);
    this.rpc_await_send = [];
  },

  send(rpcName, rpcData, rpcCallback) ,

  CallRPC = (name: TRPC, body: any, callback: RPC_Callback) => server.send(name, body, callback) as number;

  // Передача сообщения на сервер (без ожидания ответа)
  JustCallRPC = (name: TRPC, body?: any) => server.send(name, body) as void;
  
  // Передача сообщения на сервер (с ожиданием ответа)
  CallRPCPromise = (name: TRPC, body?: any) =>
    new Promise<TRPCResult>((resolve, reject) => {
      server.send(name, body, (status, body) => resolve([status, body]));
    });
  
   UnsubscribeRPC = (rpcIndex: number) => server.unsubscribe(rpcIndex);
  
};


async function ws_onOpen(this: WebSocket, ev: Event) {
  server.is_connected = true;
  const [status, body] = await CallRPCPromise("rpc_SetAccessToken", getToken);

  await CallRPCPromise("rpc_CTXInfo");

  userProfile = body;
  server.send_awaited();
  console.log("New connection");
  onAppConnected();
  trigger_event("event_OnStatuseChange", "connected");
}

// Отправка сервером сообщения для браузера/юзера
async function ws_onMessage(this: WebSocket, msg: MessageEvent<any>) {
  const response = JSON.parse(msg.data);
  const first = response[0];
  const second = response[1];
  const third = response[2];

  // rpc answer
  if (typeof first === "number") {
    const status = first as number;
    const data = second as any;
    const index = third as number | undefined;

    if (index === undefined) {
      console.log("unsubscribed #depredecated", first, second, third);
      return;
    }

    const callback = server.rpc_callback_list[index];
    const rpcname = server.rpc_callback_names[index] as TRPC | undefined;

    if (callback) {
      callback(status, data);
      server.unsubscribe(index);
    }

    if (rpcname) {
      trigger_rpc(rpcname, status, data);
    }
    return;
  }

  // server event
  if (typeof first === "string") {
    const event = first as TEvent;
    const data = second as any;
    trigger_event(event, data);
    onServerEvent(event, data);
    return;
  }
}

async function ws_onError(this: WebSocket, ev: Event) {
  console.log("Connection error", ev);
}

async function ws_onClose(this: WebSocket) {
  server.is_connected = false;
  console.log("Connection closed");
  onAppDisconnected();
  setTimeout(() => ws_Init(), 1000); // create new connection after 1000 msec
  trigger_event("event_OnStatuseChange", "disconnected");
}

function ws_Init() {
  server_ws = new WebSocket("ws://127.0.0.1:4000/ws");
  server_ws.onopen = ws_onOpen;
  server_ws.onmessage = ws_onMessage;
  server_ws.onerror = ws_onError;
  server_ws.onclose = ws_onClose;
}

ws_Init();
