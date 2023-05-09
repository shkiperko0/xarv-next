import { useEffect } from "react"

type Events = {
    [name: string]: (...args: any[]) => void
} 

type Eventer<TEvents extends Events> = {
    event_callbacks: { [name in keyof TEvents]?: TEvents[keyof TEvents][] },
    list_event_subscribers<K extends keyof TEvents>(event: K): TEvents[K][]
    subscribe_event<K extends keyof TEvents>(event: K, callback: TEvents[K]): void
    unsubscribe_event<K extends keyof TEvents>(event: K, callback: TEvents[K]): void
    trigger_event<K extends keyof TEvents>(event: K, ...data: Parameters<TEvents[K]>): void
}

export const createEventer = <TEvents extends Events>() => {
    const eventer: Eventer<TEvents> = {
        event_callbacks: {},
        list_event_subscribers: function <K extends keyof TEvents>(event: K): TEvents[K][] {
            if(this.event_callbacks[event] === undefined){
                this.event_callbacks[event] = []
            }
            return this.event_callbacks[event] as TEvents[K][]
        },
        subscribe_event: function <K extends keyof TEvents>(event: K, callback: TEvents[K]): void {
            const list = this.list_event_subscribers(event as any) 
            const subscriber_index = list.findIndex((subscriber) => subscriber === callback)
            if(subscriber_index === -1) list.push(callback)
        },
        unsubscribe_event: function <K extends keyof TEvents>(event: K, callback: TEvents[K]): void {
            const list = this.list_event_subscribers(event as any) 
            const subscriber_index = list.findIndex((subscriber) => subscriber === callback)
            if(subscriber_index !== -1) list.splice(subscriber_index,  1)
        },
        trigger_event: function <K extends keyof TEvents>(event: K, ...data: Parameters<TEvents[K]>): void {
            //console.log(event, 'triggered with data', ...data)
            const list = this.list_event_subscribers(event)
            for(const callback of list){
                (callback as any)(...data)
            }
        }
    }

    return eventer
}

export const useEventer = <TEvents extends Events, K extends keyof TEvents>(eventer: Eventer<TEvents>, event: K, callback: TEvents[K]) => {
    useEffect(() => {    
        eventer.subscribe_event(event, callback)
        return () => eventer.unsubscribe_event(event, callback)
    })
}
