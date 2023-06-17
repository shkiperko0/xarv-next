export type TEventrerImp = {
    [name: string]: (...args: any[]) => void
} 

// to do make on class

export type TEventer<Imp extends TEventrerImp> = {
    callbacks: { [name in keyof Imp]?: Imp[keyof Imp][] },
    list_subscribers<K extends keyof Imp>(event: K): Imp[K][]
    subscribe<K extends keyof Imp>(event: K, callback: Imp[K]): void
    unsubscribe<K extends keyof Imp>(event: K, callback: Imp[K]): void
    trigger<K extends keyof Imp>(event: K, ...data: Parameters<Imp[K]>): void
}

export const createEventer = <Imp extends TEventrerImp>() => {
    const eventer: TEventer<Imp> = {
        callbacks: {},

        list_subscribers: function <K extends keyof Imp>(event: K): Imp[K][] {
            if(this.callbacks[event] === undefined){
                this.callbacks[event] = []
            }
            return this.callbacks[event] as Imp[K][]
        },

        subscribe: function <K extends keyof Imp>(event: K, callback: Imp[K]): void {
            const list = this.list_subscribers(event as any) 
            const subscriber_index = list.findIndex((subscriber) => subscriber === callback)
            if(subscriber_index === -1) list.push(callback)
        },

        unsubscribe: function <K extends keyof Imp>(event: K, callback: Imp[K]): void {
            const list = this.list_subscribers(event as any) 
            const subscriber_index = list.findIndex((subscriber) => subscriber === callback)
            if(subscriber_index !== -1) list.splice(subscriber_index,  1)
        },

        trigger: function <K extends keyof Imp>(event: K, ...data: Parameters<Imp[K]>): void {
            const list = this.list_subscribers(event)
            for(const callback of list){
                (callback as any)(...data)
            }
        }
    }

    return eventer
}

