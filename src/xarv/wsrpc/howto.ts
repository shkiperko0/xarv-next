import { createClient } from '.'

// описание функций которые вызыввает клиент для исполнения на сервере
type RPC_List = { // пример удаленнывх процедур для сервера
    rpc_GetPlayerName: (player_id: number) => [number, string] // получить имя
    rpc_SetPlayerName: (player_id: number, name: string) => [number, string] // назначить имя
}

type Event_List = { // пример событий для клиента
    event_OnPlayerConnect: (player_id: number) => void // когда игрок присоединился
    event_OnPlayerDisconnect: (reason: string, player_id: number) => void // когда игрок отсоединился
}
  
const client = createClient<RPC_List, Event_List>("ws://127.0.0.1:4000/ws") // создание подключения
client.send('rpc_GetPlayerName', [1], (status, name) => { }) // узнаем имя игрока 
client.send('rpc_SetPlayerName', [1, 'New_Name'], (status, oldname) => { }) // изменяем имя игрока

client.send_promised('rpc_GetPlayerName', [1]).then(([status, name]) => { }) // узнаем имя игрока 
client.send_promised('rpc_SetPlayerName', [1, 'New_Name']).then(([status, oldname]) => { }) // изменяем имя игрока

client.eventer_rpc.subscribe('rpc_GetPlayerName', (status, name) => { }) // слушаем когда запрашивается имя
client.eventer_rpc.subscribe('rpc_SetPlayerName', (status, old_name) => { }) // слушаем когда меняется имя

client.eventer_events.subscribe('event_OnPlayerConnect', (player) => { }) // слушаем когда сервер говорит что игрок подключился
client.eventer_events.subscribe('event_OnPlayerDisconnect', (reason, player_id) => { }) // слушаем когда сервер говорит что игрок отключился