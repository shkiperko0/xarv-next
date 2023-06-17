import { useEffect } from "react"
import { TEventer, TEventrerImp } from "../plain/utils/eventer"

export const useEventer = <Imp extends TEventrerImp, K extends keyof Imp>(eventer: TEventer<Imp>, event: K, callback: Imp[K]) => {
    useEffect(() => {    
        eventer.subscribe(event, callback)
        return () => eventer.unsubscribe(event, callback)
    })
}
