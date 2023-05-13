import { createEventer, useEventer } from '.'
import { useState } from 'react'

interface IBadthing{
    shit: number
}

interface IGoodthing{
    payment: number
}

type Event_List = { // пример событий для ивентера, случилось то или иное
    onSomehingHappeds: (thing: IBadthing, chance: number) => void
    onSomehingElseHappeds: (thing: IGoodthing) => void
    everySecond: () => void
}
  
const ev = createEventer<Event_List>() // создание событийника

const Timer = setInterval(() => ev.trigger('everySecond'), 1000) // тригерим событие каждую секунду

const ComponentA = () => {
    const [count, setCount] = useState(0)
    useEventer(ev, 'everySecond', () => setCount(count => count - 1))
    useEventer(ev, 'onSomehingHappeds', (bad, chance) => { chance < 25 && setCount(count => count - bad.shit) })
    useEventer(ev, 'onSomehingElseHappeds', (good) => setCount(count => count + good.payment))

    return <>
        Money {count}
        <br />
    </>
}

function Math_random_min_max_floor(min: number, max: number){ 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

const ComponentB = () => {
    return <>
        <button type='button' onClick={() => ev.trigger('onSomehingElseHappeds', { payment: 30000 })}> Make good 30k thing </button>
        <br />
        <button type='button' onClick={() => ev.trigger('onSomehingHappeds', { shit: Math_random_min_max_floor(500, 1000) }, Math.random() * 100 )}> Randomly make bad 500 - 1k thing </button>
        <br />
    </>
}

export const EventerTestGUI = () => {
    return <>
        <ComponentA/>
        <ComponentB/>
    </>
}