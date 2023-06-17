import { useId as __super } from 'react'

//let __id = 0;

export function useId(): string {
    return __super()
    //return (__id++).toString(16)
}