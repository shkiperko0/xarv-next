import { cl } from 'src/tools/tools';
import styles from './windowmanager.module.scss';

import { 
  ReactNode, 
  createContext, 
  useContext, 
  useRef, 
  useState, 
  CSSProperties, 
  MouseEventHandler,
  useEffect
} from 'react';

import { Tabs } from '@mantine/core';
import { LeftSide, RightSide, SidedDiv } from '@components/gui/Bars';
import { Button } from '@components/gui/Button';
import { Buttons } from '@components/gui/Buttons';
import { createEventer, useEventer } from 'src/tools/subscriber';
import { useWindowEvent } from 'src/tools/hooks';

let window_id = 0;
const NewWindowID = () => (window_id++)

interface IWindowOptions{
    x?: number | string,
    y?: number | string,
    h?: number | string,
    w?: number | string,
    title: string,
    className?: string,
    wrapperprops?: any,
    wrapper?: (props: { children: ReactNode }) => JSX.Element
    style?: CSSProperties,
    onClose?: MouseEventHandler
}

type WindowID = number | undefined

interface IWindow{
    id: WindowID,
    content?: ReactNode,
    options: IWindowOptions
}


export interface ILayoutContext{
    windows: IWindow[],
    create(): IWindow,
    add(window: IWindow): void,
    open(content: ReactNode, options: IWindowOptions): WindowID,
    close(id: WindowID): void,
}

const TaskManagerContext = createContext<ILayoutContext>(null as any)
export const useWindows = () => useContext(TaskManagerContext)

interface ITaskProps{
    data: IWindow
}

const Task = (props: ITaskProps) => {
    const { data: { options: { title }, id } } = props
    return <Tabs.Tab value={id!.toString()}>
        {/* <div className={styles.task}> */}
            { title }
        {/* </div> */}
    </Tabs.Tab>
}

interface IWindowProps{
    data: IWindow
    children?: ReactNode
}

interface IPoint{
    x: number,
    y: number,
}

interface IRect{
    top: number,
    left: number,
    bottom: number,
    right: number
}

function MakePointInRect(point: IPoint, rect: IRect){
    return { 
        x: ((point.x < rect.left) ? rect.left : (point.x > rect.right ) ? rect.right : point.x),
        y: ((point.y < rect.top) ? rect.top : (point.y > rect.bottom) ? rect.bottom : point.y),
    }
}

const DefaultWindowWrapper = (props: { children: ReactNode }) => {
    return <>
        {props.children}
    </>
}

interface DragPoint{
    offsetLeft: number
    offsetTop: number
    screenX: number
    screenY: number
}

export const Window = (props: IWindowProps) => {
    const { close } = useWindows()
    //const [ isDown, setIsDown ] = useState(false)
    const ref = useRef<HTMLElement | undefined>(undefined)
    const [ dragPoint , setDragPoint ] = useState<DragPoint | null>(null)

    const { current: element } = ref

    const [ options, setOptions ] = useState(() => {
        const { 
            x = 'center', 
            y = 'center', 
            w = 'auto', 
            h = 'auto', 
            ...other 
        } = props.data.options

        return { x, y, w, h, ...other}
    })

    const tr_x = (options.x === 'center') ? 'translateX(-50%)' : null
    const tr_y = (options.y === 'center') ? 'translateY(-50%)' : null
    let transform = (tr_x || tr_y) ? [tr_x, tr_y].join(' ') : undefined

    const x = (typeof options.x == 'number') ? (options.x + 'px') : ( options.x === 'center' ? '50%' : options.x )
    const y = (typeof options.y == 'number') ? (options.y + 'px') : ( options.y === 'center' ? '50%' : options.y )

    const { style = {}, className, wrapper: Wrapper = DefaultWindowWrapper, wrapperprops = {} } = options

    useWindowEvent('mousemove', event => {
        event.preventDefault();
        if (dragPoint && element) {
            const { dx, dy } = {
                dx: event.screenX - dragPoint.screenX,
                dy: event.screenY - dragPoint.screenY
            }
            const { x, y } = {
                x: dragPoint.offsetLeft + dx,
                y: dragPoint.offsetTop + dy
            }
            const pos = { x, y }
            setOptions({
                ...options,
                ...MakePointInRect(pos, document.body.getBoundingClientRect())
            })
        }
    }, [element, dragPoint])

    useWindowEvent('mouseup', event => {
        setDragPoint(null)
    }, [dragPoint])

    return <Wrapper {...wrapperprops}>
        <div 
            ref={ref as any}
            className={cl(styles.window, className)} 
            style={{
                '--w': (typeof options.w == 'number') ? ( options.w + 'px') : options.w,
                '--h': (typeof options.h == 'number') ? ( options.h + 'px') : options.h,
                left: x, 
                top: y,
                transform
            } as any}
        >
            <div 
                className={styles.windowheader}
                onMouseDown={(event) => { 
                    event.preventDefault()
                    if(ref.current){
                        const { offsetLeft, offsetTop } = ref.current
                        const { screenX, screenY } = event
                        setDragPoint({ offsetLeft, offsetTop, screenX, screenY })
                    }
                }}
            >
                <SidedDiv>
                    <LeftSide><span title={`Window #${props.data.id}`}>{options.title}</span></LeftSide>
                    <RightSide>
                        <Buttons>
                            <Button className={styles.close_button} onClick={(event) => { 
                                close(props.data.id) 
                                props.data.options.onClose && props.data.options.onClose(event)
                            }}/>
                        </Buttons>
                    </RightSide>
                </SidedDiv>    
            </div> 
            <div 
                className={styles.windowcontent} 
                style={{
    				resize: 'both',
					overflow: 'scroll',
                    ...style,
                    height: 'var(--h)',
                    width: 'var(--w)',
                }}
            >
                {props.children ?? props.data.content}
            </div>
        </div>
    </Wrapper>
}

export const Windows = () => { 
    const { windows } = useWindows()
 
    return <>
        <div className={styles.windows}>
            { windows.map((window) => <Window key={window.id} data={window}/>) }
        </div>
    </>
}

export const useWindow = (content: ReactNode, options: IWindowOptions) => {
  //const [ id, SetID ] = useState<number | null>(null)
  const { open, close } = useWindows()
  useEffect(() => {
    const id = open(content, options)
    return () => close(id)
  }, [content, options])

}

export const Tasks = () => { 
    const { windows } = useWindows()
 
    const lastWindow = windows.findLast(w => w.id !== undefined)
    const defaultValue = lastWindow?.id?.toString()

    return <Tabs defaultValue={defaultValue} color={'dark'} variant={'pills'}>
        <Tabs.List>
            {/* <div className={styles.windows}> */}
                { windows.map((window) => <Task key={window.id} data={window}/>) }
            {/* </div> */}
        </Tabs.List>
    </Tabs>
}

const TestEventer = createEventer<{
    log: (str: string) => void
    log2: (b: boolean, n: number) => void
    log3: (b: boolean, ...n: number[]) => void
}>()

export const Layout = (props: { children: ReactNode }) => {
    const [ windows, setWindows ] = useState<IWindow[]>([])

    const options: ILayoutContext = {
        windows,

        open(content, options) {
            const id = NewWindowID()
            setWindows([ ...windows, {
                id, content, options                
            }])
            return id
        },

        close(id) {
            setWindows(windows.filter(window => window.id != id))
        },

        create(){
            return { id: NewWindowID() } as any
        },

        add(window){
            setWindows([ ...windows, window])
        }
    }

    return <>
        <TaskManagerContext.Provider value={options}>
            {props.children}
            <Windows/>
        </TaskManagerContext.Provider>
    </>
}

