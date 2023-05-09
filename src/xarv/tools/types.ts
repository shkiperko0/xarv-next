export interface IDragPoint{
    offsetLeft: number
    offsetTop: number
    screenX: number
    screenY: number
}

export interface IPoint{
    x: number
    y: number
}

export interface IVector{
    x: number
    y: number
    z: number
}

export interface IRect{
    top: number
    left: number
    bottom: number
    right: number
}

export type DragmovementCallback = (pos: IPoint) => void