import { useState, RefObject } from 'react'
import { IPoint, IRect } from '../plain/types'
import { useHtmlElementEvent, useWindowEvent } from '.'

export interface IDragPoint{
    offsetLeft: number
    offsetTop: number
    screenX: number
    screenY: number
}

export interface DragmovementData{
    pos: IPoint
    dif: IPoint
    event: MouseEvent
    type: 'movestart' | 'moveend' | 'move'
}

export type DragmovementCallback = (data: DragmovementData) => void
export interface DragmovementOptions{
    bounder?: (pos: IPoint) => IPoint
    allowHandler?: (element: HTMLElement) => boolean
    dragger: DragmovementCallback
}

export function ItemInnerBounder(bounder: RefObject<HTMLElement>, item: RefObject<HTMLElement>){
    return ({x, y}: IPoint) => {
      if(bounder.current && item.current){
      const hr = bounder.current.getBoundingClientRect()
      const wr = item.current.getBoundingClientRect()
      return { 
        x: x < 0 ? 0 : (x + wr.width) > hr.width ? (hr.width - wr.width) : x, 
        y: y < 0 ? 0 : (y + wr.height) > hr.height ? (hr.height - wr.height) : y,
      }} else {
        return { x, y }
      }
    }
  }

  export function ItemOuterBounder(bounder: RefObject<HTMLElement>, frame: RefObject<HTMLElement>){
    return ({x, y}: IPoint) => {
      if(bounder.current && frame.current){
      const hr = bounder.current.getBoundingClientRect()
      const fr = frame.current.getBoundingClientRect()
      return { 
        x: (fr.width  > hr.width)  ? (x > 0 ? 0 : x < -(fr.width  - hr.width) ?  -(fr.width  - hr.width)  : x) : (x < 0 ? 0 : (x + fr.width)  > hr.width  ? (hr.width  - fr.width)  : x),
        y: (fr.height > hr.height) ? (y > 0 ? 0 : y < -(fr.height - hr.height) ? -(fr.height - hr.height) : y) : (y < 0 ? 0 : (y + fr.height) > hr.height ? (hr.height - fr.height) : y),
      }
    } else {
        return { x, y }
      }
    }
  }
  
  export function NonControllDragAllower (element: HTMLElement) {
    return ['HTMLInputElement', 'HTMLButtonElement'].indexOf(element.constructor.name) == -1
  }
  
  export function RefDragAllower(refs: RefObject<HTMLElement> | RefObject<HTMLElement>[]){
    return (element: HTMLElement) => {
        if(refs instanceof Array){
            for(const { current } of refs){
                if(current && current.contains(element as HTMLElement)) return true
            }
            return false
        }
        return refs.current ? refs.current.contains(element as HTMLElement) : false
    }
  }

export const useDragMovement = <MyElement extends HTMLElement>(ref: RefObject<MyElement>, options: DragmovementOptions) => {
    const [dragPoint, setDragPoint] = useState<IDragPoint | null>(null)

    const calculations = (dragPoint: IDragPoint, event: MouseEvent) => {
        const { 
            screenX, 
            screenY 
        } = event

        const dif = {
            x: screenX - dragPoint.screenX,
            y: screenY - dragPoint.screenY
        }

        const { x, y } = {
            x: dragPoint.offsetLeft + dif.x,
            y: dragPoint.offsetTop + dif.y
        }

        const pos = options.bounder ? options.bounder({ x, y }) : { x, y }
        return { pos, dif }
    }

    useWindowEvent('mousemove', event => {
        event.preventDefault();
        if(dragPoint === null) return
        const { pos, dif } = calculations(dragPoint, event)
        options.dragger({pos, dif, event, type: 'move'})
        setDragPoint({...dragPoint})
    }, [dragPoint, options])

    useWindowEvent('mouseup', event => {
        if(dragPoint === null) return
        const { pos, dif } = calculations(dragPoint, event)
        options.dragger({pos, dif, event, type: 'moveend'})
        setDragPoint(null)
    }, [dragPoint, options])

    useHtmlElementEvent(ref, 'mousedown', (event) => {
        if(options.allowHandler && event.target && !options.allowHandler(event.target as HTMLElement)) return
        const { current: element } = ref
        if(dragPoint !== null || element === null) return
        const { offsetLeft, offsetTop } = element
        const { screenX, screenY } = event
        const newDragPoint = { offsetLeft, offsetTop, screenX, screenY } 
        setDragPoint(newDragPoint)
        const { pos, dif } = calculations(newDragPoint, event)
        options.dragger({pos, dif, event, type: 'movestart'})
        event.preventDefault()
        event.stopPropagation()
    }, [options, dragPoint])

    return { dp: dragPoint }
}