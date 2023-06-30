import { RefObject, createContext, useContext, useRef, useState, PropsWithChildren, HTMLAttributes, CSSProperties } from 'react';
import styles from './styles.module.scss';
import { useDragMovement } from 'src/xarv/hooks';
import { ItemInnerBounder, NonControllDragAllower } from 'src/xarv/hooks/useDragMovement';
import { cl } from 'src/xarv/plain/utils';
import { Buttons } from 'src/xarv/components/button';
import { Button, CloseButton, Tabs } from '@mantine/core';
export { styles as taskmanagerStyles };

let window_id = 0;
const NewWindowID = () => window_id++;

type TWindowMode = 'minimized' | 'maximized' | 'normal';

export interface IWindow{
  id: number;
  title: string;
  mode: TWindowMode
  x: number
  y: number
  height: number
  width: number
  className?: string
  Caption: (props: IWindowProps, ref: RefObject<HTMLElement>) => JSX.Element
  Content: (props: IWindowProps, ref: RefObject<HTMLElement>) => JSX.Element
  Task: (props: IWindowProps, ref: RefObject<HTMLElement>) => JSX.Element
  Wrapper: (props: PropsWithChildren<IWindowProps>, ref: RefObject<HTMLElement>) => JSX.Element
}

export interface IWindowProps{
  window: IWindow
}

export interface ExtendedDivProps extends HTMLAttributes<HTMLDivElement>{}

export const SidedBar = (props: ExtendedDivProps) => <div {...props} className={cl(styles.lrbar, props.className)} />
export const Left = (props: ExtendedDivProps) => <div {...props} className={cl(styles.left, props.className)} />
export const Right = (props: ExtendedDivProps) => <div {...props} className={cl(styles.right, props.className)} />

function DefaultWindowCaption({ window }: IWindowProps){
  return <SidedBar className={styles.windowCaption}>
    <Left>
      <span className='truncate max-w-full'>{`#${window.id} `}{window.title}</span> 
    </Left>
    <Right>
      <Buttons>
        <WindowMinimizeButton/>
        <WindowFullscreenButton/>
        <WindowCloseButton/>
      </Buttons>
    </Right>
  </SidedBar>
}

export interface IWindowOpenOptions{
  title: string,
  className?: string
  Caption?: (props: IWindowProps) => JSX.Element
  Task?: (props: IWindowProps) => JSX.Element
  Wrapper?: (props: IWindowProps) => JSX.Element
  Render: (props: IWindowProps) => JSX.Element
}

type WindowRefresher = (id?: number, updater?: (w: IWindow) => IWindow) => void
export interface IWindowsCore{  
  open: (options: IWindowOpenOptions) => void;
  close: (id: number) => void;
  refresh: WindowRefresher
  list: IWindow[]; 
}

export function useWindowsCore(): IWindowsCore {
  const [ list, setList ] = useState<IWindow[]>([]);

  const refresh = (id?: number, updater?: (w: IWindow) => IWindow) => {
    if(id === undefined || updater === undefined){
      return setList(list => [...list])
    }

    setList(list => list.map(w => (w.id == id ? updater(w) : w)))
  }

  function close(id: number) {
    setList(list => list.filter(
        window => window.id != id
    ))
  }

  function open(options: IWindowOpenOptions) {
    const id = NewWindowID();
    const window: IWindow = {
      id,
      className: options.className,
      Content: options.Render,
      Caption: options.Caption ?? DefaultWindowCaption,
      Task: options.Task ?? DefaultWindowTask,
      Wrapper: options.Wrapper ?? DefaultWindowWrapper,
      title: options.title,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      mode: 'normal'
    }
    return setList(list => [...list, window])
  }

  return {
    list, open, close, refresh
  }
}

export const WindowsLayout = ({children}: PropsWithChildren<{}>) => {
  const core = useWindowsCore()
  return <>
      <WindowsCore.Provider value={core}>
        {children}
        <WindowsHolder />
        <TasksBar/>
      </WindowsCore.Provider>
    </>
}

const WindowsCore = createContext<IWindowsCore>(null as any);
const WindowCTX = createContext<IWindow>(null as any);

export const useWindows = () => ({ ...useContext<IWindowsCore>(WindowsCore), current: useContext<IWindow>(WindowCTX) as (IWindow | null) }) 

function DefaultWindowWrapper({ children }: PropsWithChildren<IWindowProps>){
  return <>{children}</>
}

function WindowMapper({ holder, window }: IWindowProps & { holder: RefObject<HTMLElement> }){
  const { Caption, Content, Wrapper, x, y, className, height, width, mode } = window
  const wrappeRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useDragMovement(wrappeRef, {
    dragger: ({ pos }) => {
      window.x = pos.x
      window.y = pos.y
    },
    bounder: ItemInnerBounder(holder, wrappeRef),
    allowHandler: NonControllDragAllower //RefDragAllower(captionRef)
  })

  const styleHW: CSSProperties = mode === 'normal' ? {
    height: height === 0 ? 'fit-content' : height, 
    width: width === 0 ? 'fit-content' : width
  } : {
    height: '100vh', 
    width: '100vw'
  }

  const styleWrapper: CSSProperties = 
    mode === 'maximized' ? { ...styleHW, left: 0, top: 0 } : 
    mode === 'minimized' ? { display: 'none' } : 
    styleHW

  return <div className={cl(styles.windowWrapper, className)} ref={wrappeRef} style={{ left: x, top: y, position: 'absolute', ...styleWrapper  }}> 
    <WindowCTX.Provider value={window}>
      <Wrapper window={window}>
          <div ref={captionRef} className='w-full'>
            <Caption window={window}/>
          </div>
          <div ref={contentRef} style={{backgroundColor: 'white', ...styleHW}}>
            <Content window={window}/>
          </div>
      </Wrapper>
    </WindowCTX.Provider>
  </div>
}

function WindowsHolder(){
  const { list } = useWindows()
  const holderRef = useRef<HTMLDivElement>(null)
  
  return <>
    <div ref={holderRef} className={styles.windowsHolder}> 
      {
        list.map(
          window => <WindowMapper key={window.id} window={window} holder={holderRef} />
        )
      }
    </div>
  </>
}


// function DefaultWindowTask({ window }: IWindowProps){
//   return <div className={styles.windowTask}>
//     <span>{`#${window.id} `}{window.title}</span>
//   </div>
// }

function DefaultWindowTask({ window }: IWindowProps){
  return <div className={styles.windowTask}>
    <span style={{ color: window.mode === 'minimized' ? '#000' : '#fff' }}>{`#${window.id} `}{window.title}</span>
  </div>
}

function WindowCloseButton(){
  const windows = useWindows()

  return <CloseButton
      aria-label="Close modal"
      className={styles.close_button}
      iconSize={24}
      onClick={() => windows.close(windows.current!.id)}
  />
}

function WindowMinimizeButton(){
  const windows = useWindows()

  return <Button
    compact
    className={styles.minimize_button}
    onClick={() => windows.refresh(windows.current!.id, w => ({ ...w, mode: 'minimized' }))}
  >
    <svg fill="#868e96" height="512px" version="1.1" viewBox="0 0 512 512" width="512px" xmlSpace="preserve">
      <style type="text/css"></style>
      <g className="st1" id="layer">
        <line className="st0" x1="461" x2="51" y1="461" y2="461" />
      </g>
      <g id="layer_copy">
        <g>
          <path d="M461,469H51c-4.418,0-8-3.582-8-8s3.582-8,8-8h410c4.418,0,8,3.582,8,8S465.418,469,461,469z" />
        </g>
      </g>
    </svg>
  </Button>
}

function WindowFullscreenButton(){
  const windows = useWindows()

  return <Button
    compact
    variant="outline"
    size="xs"
    className={styles.fullScreen_button}
    onClick={() => windows.refresh(windows.current!.id, w => ({ ...w, mode: w.mode === 'normal' ? 'maximized' : 'normal' }))}
  >
    <svg height="18px" version="1.1" viewBox="0 0 18 18" width="18px">
      <g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1">
        <g fill="#868e96" id="Core" transform="translate(-3.000000, -87.000000)">
          <g id="check-box-outline-blank" transform="translate(3.000000, 87.000000)">
            <path
              d="M16,2 L16,16 L2,16 L2,2 L16,2 L16,2 Z M16,0 L2,0 C0.9,0 0,0.9 0,2 L0,16 C0,17.1 0.9,18 2,18 L16,18 C17.1,18 18,17.1 18,16 L18,2 C18,0.9 17.1,0 16,0 L16,0 L16,0 Z"
              id="Shape"
            />
          </g>
        </g>
      </g>
    </svg>
  </Button>
}

export const TasksBar = () => {
  const { list, refresh } = useWindows()
  const defaultValue = list.length > 0 ? list[0].id.toFixed() : undefined 

  // return <Tabs color={state?.mode === 'minimized' ? 'gray' : 'dark'} variant="pills" defaultValue={id.toString()}>
  //   <Tabs.List>
  //     <Tabs.Tab onClick={() => setState(id, { mode: state?.mode === 'minimized' ? 'normal' : 'minimized' })} value={id.toString()}>
  //       <span style={{ color: state?.mode === 'minimized' ? '#000' : '#fff' }}>
  //         #{id} {title}
  //       </span>
  //     </Tabs.Tab>
  //   </Tabs.List>
  // </Tabs>

  return <>
    <Tabs variant="pills" defaultValue={defaultValue}>
      <Tabs.List>
        {
          list.map(
            (Window) => {
              const {id, mode} = Window

              const MimMaxNor = (w: IWindow): IWindow => ({ ...w,  mode: w.mode === 'minimized' ? 'normal' : 'minimized' })

              return <>
                <Tabs.Tab onClick={() => refresh(id, MimMaxNor)} value={id.toString()}>
                  <Window.Task key={Window.id} window={Window} />
                </Tabs.Tab>
              </>
            }
          )
        }
      </Tabs.List>
    </Tabs>
  </>


  // return <>
  //   <div className={styles.tasksBar}>
  //     {
  //       list.map(
  //         Window => <Window.Task key={Window.id} window={Window} />
  //       )
  //     }
  //   </div>
  // </>
}







