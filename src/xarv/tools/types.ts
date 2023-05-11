import { NullLiteral } from "typescript"

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

export type HavePrototype = { prototype: any }
export type HaveDefault = { default: any }
export type ClassPrototype<Class extends (HavePrototype | null | undefined)> = NonNullable<Class>['prototype']
export type ModuleFunction<ModuleType> = (module: ModuleType) => any