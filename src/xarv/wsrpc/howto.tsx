import { useState } from 'react'
import { createClient, useWSC_Event, useWSC_RPC } from './index2'

// описание функций которые вызыввает клиент для исполнения на сервере
type RPC_List = { // пример удаленнывх процедур для сервера
    rpc_Hello: { 
        send: null
        recv: [status: number, hello: {answer_to: string}] 
    },
    
    rpc_GetPlayerName: { 
        send: {player_id: number}
        recv: [status: number, name: string] // получить имя
    },
    
    rpc_SetPlayerName: { 
        send: {player_id: number, name: string},
        recv: [status: number, oldname: string] // назначить имя
    },
    
    rpc_Echo: {
        send: { asd: string }
        recv: [status: number, echo: { asd: string }]
    }
}


type Event_List = { // пример событий для клиента
    event_Timer: (seconds_on_sever: number) => void
    event_OnPlayerConnect: (player_id: number) => void // когда игрок присоединился
    event_OnPlayerDisconnect: (reason: string, player_id: number) => void // когда игрок отсоединился
}
  
const client = createClient<RPC_List, Event_List>("ws://127.0.0.1:4000/ws") // создание подключения
// client.send('rpc_GetPlayerName', [1], (status, name) => { }) // узнаем имя игрока 
// client.send('rpc_SetPlayerName', [1, 'New_Name'], (status, oldname) => { }) // изменяем имя игрока

// client.send_promised('rpc_GetPlayerName', [1]).then(([status, name]) => { }) // узнаем имя игрока 
// client.send_promised('rpc_SetPlayerName', [1, 'New_Name']).then(([status, oldname]) => { }) // изменяем имя игрока

// client.eventer_rpc.subscribe('rpc_GetPlayerName', (status, name) => { }) // слушаем когда запрашивается имя
// client.eventer_rpc.subscribe('rpc_SetPlayerName', (status, old_name) => { }) // слушаем когда меняется имя

// client.eventer_events.subscribe('event_OnPlayerConnect', (player) => { }) // слушаем когда сервер говорит что игрок подключился
// client.eventer_events.subscribe('event_OnPlayerDisconnect', (reason, player_id) => { }) // слушаем когда сервер говорит что игрок отключился

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