
export type HttpMethod = 'POST' | 'GET' | 'PUT' | 'DELETE' | 'OPTIONS'
export type HttpMethods = HttpMethod | '*'

export type JSType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function";

export type callback<Type = void> = () => Type

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