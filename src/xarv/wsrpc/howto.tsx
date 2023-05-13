import { useState } from 'react'
import { createClient, useWSC_Event, useWSC_RPC } from './index_v2'


type RPC_List_V2 = { 
    rpc_Hello: { 
        send: null
        recv: [status: number, hello: {answer_to: string}] 
    },
    
    rpc_Echo: {
        send: { asd: string }
        recv: [status: number, echo: { asd: string }]
    }
}

type RPC_List_V1 = { 
    rpc_Hello: (data: null) => [status: number, hello: {answer_to: string}] 
    rpc_Echo: (data: { asd: string }) => [status: number, echo: { asd: string }]
}


type RPC_List_V2TOV1 <T extends Record<string, { send: any, recv: any }>> = {
    [K in keyof T]: (data: T[K]['send']) => T[K]['recv']
  }
  

type RPC_List_V1TOV2<T> = {
    [K in keyof T]: {
        send: T[K] extends (data: infer U) => any ? U : null,
        recv: T[K] extends (...args: any[]) => infer R ? R : never
    }
};

type Event_List = { // пример событий для клиента
    event_Timer: (seconds_on_sever: number) => void
    event_OnPlayerConnect: (player_id: number) => void // когда игрок присоединился
    event_OnPlayerDisconnect: (reason: string, player_id: number) => void // когда игрок отсоединился
}
  
const client = createClient<RPC_List_V2, Event_List>("ws://127.0.0.1:4000/ws") // создание подключения

const ComponentA = () => {
    const [count, setCount] = useState(0)
    const [seconds, setSeconds] = useState(0)
    useWSC_RPC(client, 'rpc_Hello', (status, { answer_to }) => alert(`${status}: Hello from '${answer_to}'`))
    useWSC_RPC(client, 'rpc_Echo', (status, { asd }) => alert(`${status}: Echo '${asd}'`))
    useWSC_Event(client, 'event_OnPlayerConnect', (status) => setCount(count => count + 1))
    useWSC_Event(client, 'event_OnPlayerDisconnect', (reason, status) => setCount(count => count - 1))
    useWSC_Event(client, 'event_Timer', setSeconds)

    return <>
        Players {count}
        <br />
        Seconds {seconds}
        <br />
    </>
}

const ComponentB = () => {
    return <>
        <button type='button' onClick={() => client.fake_event('event_OnPlayerConnect', [0])}> Add player </button>
        <br />
        <button type='button' onClick={() => client.fake_event('event_OnPlayerDisconnect', ['powel nahoy', 0])}> Remove player </button>
        <br />
        <button type='button' onClick={() => client.send('rpc_Hello', null)}> Say hello </button>
        <br />
        <button type='button' onClick={() => client.send('rpc_Echo', { asd: 'asdasd' }, (status, {asd}) => {} )}> Send echo </button>
        <br />
    </>
}

export const WSRpcTestGUI = () => {
    return <>
        <ComponentA/>
        <ComponentB/>
    </>
}