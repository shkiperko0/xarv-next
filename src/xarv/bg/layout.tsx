import { MouseEventHandler, ReactNode, useState } from "react"
import { BackgroundContext, IBackgroundContext, useBackground } from "./context"
import styles from './bg.module.scss'

interface IBackgroundProps {
    onClick?: MouseEventHandler
}

function Background(props: IBackgroundProps) {
    const { onClick } = props
    const { content } = useBackground()
    return <>
        {
            content &&
            <div className={styles.bgwrapper} >
                <div className={styles.bg} onClick={onClick}>
                    <div className={styles.bgcontent} onClick={(event) => event.stopPropagation()}>
                        {content}
                    </div>
                </div>
            </div>
        }
    </>
}

interface IBackgroundLayoutProps {
    children?: ReactNode,
}

interface IBackgroundState {
    content?: JSX.Element
    handler?: MouseEventHandler
}

export function BackgroundLayout(props: IBackgroundLayoutProps) {
    const [state, setState] = useState<IBackgroundState>({})
    const { content, handler } = state

    const settings: IBackgroundContext = {
        content,
        open: (content, handler) => { setState({ content, handler }), console.log(state) },
        close: () => setState({}),
    }

    return <BackgroundContext.Provider value={settings}>
        {props.children}
        <Background onClick={handler ? handler : () => close} />
    </BackgroundContext.Provider>
}