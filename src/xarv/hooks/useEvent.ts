import { DependencyList, MutableRefObject, useEffect } from "react"

type WindowEventListener<K extends keyof WindowEventMap> = (this: Window, ev: WindowEventMap[K]) => any
export function useWindowEvent<K extends keyof WindowEventMap>(eventName: K, callback: WindowEventListener<K>, dep: DependencyList = []){
  useEffect(() => {
    window.addEventListener(eventName, callback)
    return () => {
      window.removeEventListener(eventName, callback)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dep, eventName, callback])
}

type HtmlElementEventListener<K extends keyof HTMLElementEventMap> = (this: HTMLElement, ev: HTMLElementEventMap[K]) => any
export function useHtmlElementEvent<K extends keyof HTMLElementEventMap>(ref: MutableRefObject<HTMLElement | null>, eventName: K, callback: HtmlElementEventListener<K>, dep: DependencyList = []){
  useEffect(() => {
    const { current } = ref
    if(current){
      current.addEventListener(eventName, callback)
      return () => current.removeEventListener(eventName, callback)
    }
    return
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dep, eventName, callback, ref])
}