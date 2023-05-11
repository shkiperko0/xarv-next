import { DependencyList, useEffect, MutableRefObject, useState, useCallback } from "react"
import { DragmovementCallback, IDragPoint } from "./types"
import { MakePointInRect } from "./tools"

type WindowEventListener<K extends keyof WindowEventMap> = (this: Window, ev: WindowEventMap[K]) => any
export function useWindowEvent<K extends keyof WindowEventMap>(eventName: K, callback: WindowEventListener<K>, dep: DependencyList = []){
  useEffect(() => {
    window.addEventListener(eventName, callback)
    return () => {
      window.removeEventListener(eventName, callback)
    }
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
  }, [...dep, eventName, callback, ref])
}

export const useDragMovement = (ref: MutableRefObject<HTMLDivElement | null>, callback: DragmovementCallback) => {
    const [dragPoint, setDragPoint] = useState<IDragPoint | null>(null)

    useWindowEvent('mousemove', event => {
        event.preventDefault();
        const { current: element } = ref
        if (dragPoint && element) {
            const { dx, dy } = {
                dx: event.screenX - dragPoint.screenX,
                dy: event.screenY - dragPoint.screenY
            }
            const { x, y } = {
                x: dragPoint.offsetLeft + dx,
                y: dragPoint.offsetTop + dy
            }
            const pos = MakePointInRect({ x, y }, element.parentElement!.getBoundingClientRect())
            callback(pos)
            setDragPoint({...dragPoint})
        }
    }, [ref, dragPoint, callback])

    useWindowEvent('mouseup', event => {
        setDragPoint(null)
    }, [dragPoint])

    useHtmlElementEvent(ref, 'mousedown', (event) => { 
        event.preventDefault()
        if(ref.current){
            const { offsetLeft, offsetTop } = ref.current
            const { screenX, screenY } = event
            setDragPoint({ offsetLeft, offsetTop, screenX, screenY })
        }
    })

    return { dp: dragPoint }
}

export function useLocalStorage(key: string, defaultValue: any) {
  return useStorage(key, defaultValue, window.localStorage)
}

export function useSessionStorage(key: string, defaultValue: any) {
  return useStorage(key, defaultValue, window.sessionStorage)
}

export function useStorage(key: string, defaultValue: any, storageObject: Storage) {
  const [value, setValue] = useState(() => {
    const jsonValue = storageObject.getItem(key)
    if (jsonValue != null) return JSON.parse(jsonValue)

    if (typeof defaultValue === "function") {
      return defaultValue()
    } else {
      return defaultValue
    }
  })

  useEffect(() => {
    if (value === undefined) return storageObject.removeItem(key)
    storageObject.setItem(key, JSON.stringify(value))
  }, [key, value, storageObject])

  const remove = useCallback(() => {
    setValue(undefined)
  }, [])

  return [value, setValue, remove]
}

export function useImport<
  ModuleType extends { default: any }, 
  ModFunc extends (_: ModuleType) => any = (m: ModuleType) => ModuleType, 
  ModResult = ReturnType<ModFunc>
>
  (impprom: Promise<ModuleType>, mod: ModFunc = ((m: ModuleType) => m) as any): ModResult | null { 
  const [ module_mod, setModuleMod ] = useState<ModResult | null>(null)

  useEffect(() => { impprom.then(module => {
    setModuleMod(mod(module))
  }) }, [impprom, mod])

  return module_mod
}

export function useImportDefault<
  ModuleType extends { default: any }, 
  ModFunc extends (_: ModuleType) => any = (m: ModuleType) => ModuleType['default'], 
  ModResult = ReturnType<ModFunc>
>
  (impprom: Promise<ModuleType>, mod: ModFunc = ((m: ModuleType) => m.default) as any): ModResult | null { 
  const [ module_mod, setModuleMod ] = useState<ModResult | null>(null)

  useEffect(() => { impprom.then(module => {
    setModuleMod(mod(module))
  }) }, [impprom, mod])

  return module_mod
}
