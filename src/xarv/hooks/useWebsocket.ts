import { useEffect, useState } from "react";

export const useWebsocket = (url: string, callback: (msg: MessageEvent<any>) => void) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  
    const [ isOnline, setIsOnline ] = useState(false)
  
    const init = () => {
      setWs(new WebSocket(url))
    }
  
    const reconnect_timer = () => {
      if(timer !== null){ clearTimeout(timer) }
      const ntimer = setTimeout(init, 3000)
      setTimer(ntimer)
    }
  
    const onopen = (event: Event) => {
      setIsOnline(true)
      //ws && ws.dispatchEvent(event)
    }
  
    const onclose = (event: CloseEvent) => {
      setIsOnline(false)
      //ws && ws.dispatchEvent(event)
      reconnect_timer()
    }
  
    useEffect(() => {
      if(ws === null) return
      ws.addEventListener('open', onopen)
      ws.addEventListener('close', onclose)
      return () => {
        ws.removeEventListener('open', onopen)
        ws.removeEventListener('close', onclose)
        ws.close()
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ws])
  
    useEffect(init, [url])
  
    useEffect(() => {
      if(ws === null) return
      ws.addEventListener('message', callback)
      return () => {
        ws.removeEventListener('message', callback)
      }
    }, [ws, callback]);
  
    return {
      isOnline, send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => { ws && ws.send(data) },
    };
  };