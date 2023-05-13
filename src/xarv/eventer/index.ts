import { useEffect } from "react"

type Events<T extends (string | number | symbol) = any> = Record<T, (...args: any) => void>

type Eventer<TEvents extends Events<keyof TEvents>> = {
    event_callbacks: { [name in keyof TEvents]?: TEvents[keyof TEvents][] },
    list_subscribers<K extends keyof TEvents>(event: K): TEvents[K][]
    subscribe<K extends keyof TEvents>(event: K, callback: TEvents[K]): void
    unsubscribe<K extends keyof TEvents>(event: K, callback: TEvents[K]): void
    trigger<K extends keyof TEvents>(event: K, ...data: Parameters<TEvents[K]>): void
}

export const createEventer = <TEvents extends Events<keyof TEvents>>() => {
    const eventer: Eventer<TEvents> = {
        event_callbacks: {},
        list_subscribers: function <K extends keyof TEvents>(event: K): TEvents[K][] {
            if(this.event_callbacks[event] === undefined){
                this.event_callbacks[event] = []
            }
            return this.event_callbacks[event] as TEvents[K][]
        },
        subscribe: function <K extends keyof TEvents>(event: K, callback: TEvents[K]): void {
            const list = this.list_subscribers(event as any) 
            const subscriber_index = list.findIndex((subscriber) => subscriber === callback)
            if(subscriber_index === -1) list.push(callback)
        },
        unsubscribe: function <K extends keyof TEvents>(event: K, callback: TEvents[K]): void {
            const list = this.list_subscribers(event as any) 
            const subscriber_index = list.findIndex((subscriber) => subscriber === callback)
            if(subscriber_index !== -1) list.splice(subscriber_index,  1)
        },
        trigger: function <K extends keyof TEvents>(event: K, ...data: Parameters<TEvents[K]>): void {
            const list = this.list_subscribers(event)
            for(const callback of list){
                (callback as any)(...data)
            }
        }
    }

    return eventer
}

export const useEventer = <TEvents extends Events<keyof TEvents>, K extends keyof TEvents>(eventer: Eventer<TEvents>, event: K, callback: TEvents[K]) => {
    useEffect(() => {    
        eventer.subscribe(event, callback)
        return () => eventer.unsubscribe(event, callback)
    })
}
