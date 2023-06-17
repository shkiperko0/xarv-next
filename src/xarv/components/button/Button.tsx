import { MouseEventHandler, ReactNode } from "react"
import styles from "./styles.module.scss"
import { cl } from "src/xarv/plain/utils"

export interface IButtonProps{
    type?: 'button' | 'submit' | 'reset' 
    className?: string
    children?: ReactNode,
    onClick?: MouseEventHandler<HTMLButtonElement>
}

export default function Button({
    type = 'button', 
    className,
    children,
    onClick
}: IButtonProps){
    return <button 
        type={type} 
        className={cl(styles.button, className)} 
        onClick={onClick}>
        {children}
    </button>
}