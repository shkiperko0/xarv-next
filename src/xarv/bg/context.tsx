import { createContext, MouseEventHandler, useContext } from "react"

export interface IBackgroundContext{
    content?: JSX.Element, 
    onClick?: MouseEventHandler,
    open(content: JSX.Element, action?: MouseEventHandler): void,
    close(): void,
}

export const BackgroundContext = createContext<IBackgroundContext>({ 
    open(){}, 
    close: () => {}
})

export const useBackground = () => useContext(BackgroundContext)
