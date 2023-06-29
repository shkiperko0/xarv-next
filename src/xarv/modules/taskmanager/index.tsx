import { RefObject, createContext, useContext, useRef, useState } from 'react';
import { ChildrenProp } from 'src/xarv/plain/react';
import styles from './styles.module.scss';
import { useDragMovement } from 'src/xarv/hooks';
import { ItemInnerBounder, NonControllDragAllower, RefDragAllower } from 'src/xarv/hooks/useDragMovement';
export { styles as taskmanagerStyles };

let window_id = 0;
const NewWindowID = () => window_id++;

type TWindowMode = 'minimized' | 'maximized' | 'normal';

interface IWindow{
  id: number;
  title: string;
  mode: TWindowMode
  x: number
  y: number
  height: number
  width: number
  className?: string
}

interface IWindowInternal extends IWindow {
  Caption: (props: IWindowProps, ref: RefObject<HTMLElement>) => JSX.Element
  Content: (props: IWindowProps, ref: RefObject<HTMLElement>) => JSX.Element
  Task: (props: IWindowProps, ref: RefObject<HTMLElement>) => JSX.Element
  Wrapper: (props: IWindowProps & ChildrenProp, ref: RefObject<HTMLElement>) => JSX.Element
}

interface IWindowPropsInternal{
  window: IWindowInternal
}

export interface IWindowProps{
  window: IWindow
}

function DefaultWindowWrapper({ children }: IWindowProps & ChildrenProp){
  return <div className={styles.windowWrapper}>
    {children}
  </div>
}

function DefaultWindowTask({ window }: IWindowProps){
  return <div className={styles.windowTask}>
    <span>{`#${window.id} `}{window.title}</span>
  </div>
}

function DefaultWindowCaption({ window }: IWindowProps){
  return <div className={styles.windowCaption}>
    <span>{`#${window.id} `}{window.title}</span>
  </div>
}

export interface IWindowOpenOptions{
  title: string,
  className?: string
  Caption?: (props: IWindowProps) => JSX.Element
  Task?: (props: IWindowProps) => JSX.Element
  Wrapper?: (props: IWindowProps) => JSX.Element
  Render: (props: IWindowProps) => JSX.Element
}

export interface IWindowsCore{  
  open: (options: IWindowOpenOptions) => number;
  close: (id: number) => void;
  list: IWindow[]; 
}

interface IWindowsCoreInternal extends IWindowsCore{  
  list: IWindowInternal[]; 
  //refresh: (window: IWindow, refresh: (_: IWindow) => IWindow) => void;
  refresh: () => void;
}

export function useWindowsCore(): IWindowsCoreInternal {
  const [ list, setList ] = useState<IWindowInternal[]>([]);

  // const refresh: IWindowsCoreInternal['refresh'] = (window, refresh) => setList(list => list.map(item => {
    
  // }))

  const refresh = () => setList(list => [...list])

  function close(id: number) {
    setList(list => list.filter(
        window => window.id != id
    ))
  }

  function open(options: IWindowOpenOptions) {
    const id = NewWindowID();
    const window: IWindowInternal = {
      id,
      className: options.className,
      Content: options.Render,
      Caption: options.Caption ?? DefaultWindowCaption,
      Task: options.Task ?? DefaultWindowTask,
      Wrapper: options.Wrapper ?? DefaultWindowWrapper,
      title: options.title,
      width: 800,
      height: 600,
      x: 0,
      y: 0,
      mode: 'normal'
    }
    setList(list => [...list, window])
    return id
  }

  return {
    list, open, close, refresh
  }
}

export const WindowsLayout = ({children}: ChildrenProp) => {
  const core = useWindowsCore()
  return <>
      <WindowsCore.Provider value={core}>
        {children}
        <WindowsHolder />
        <TasksBar/>
      </WindowsCore.Provider>
    </>
}

const WindowsCore = createContext<IWindowsCoreInternal>(null as any);
const useWindowsInternal = () => useContext<IWindowsCoreInternal>(WindowsCore);
export const useWindows = () => useContext<IWindowsCore>(WindowsCore as any);

function WindowMapper({ holder, window }: IWindowPropsInternal & { holder: RefObject<HTMLElement> }){
  const { Caption, Content, Wrapper, x, y } = window
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

  return <div ref={wrappeRef} style={{ left: x, top: y, position: 'absolute' }}> 
    <Wrapper window={window}>
        <div ref={captionRef}><Caption window={window}/></div>
        <div ref={contentRef}><Content window={window}/></div>
    </Wrapper>
  </div>
}

function WindowsHolder(){
  const { list } = useWindowsInternal()
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

const TasksBar = () => {
  const { list } = useWindowsInternal()

  return <>
    <div className={styles.tasksBar}>
      {
        list.map(
          Window => <Window.Task key={Window.id} window={Window} />
        )
      }
    </div>
  </>
}















// const Window = (props: IWindowProps) => {
//   const { close, setState } = useWindows();
//   // console.log({ close });
//   const [isDown, setIsDown] = useState(false);
//   const ref = useRef<HTMLElement | undefined>(undefined);

//   const [options, setOptions] = useState(() => {
//     const { x = 'center', y = 'center', w = '500px', h = 'auto', ...other } = props.data.options;

//     return { x, y, w, h, ...other };
//   });

//   const tr_x = options.x === 'center' ? 'translateX(-50%)' : null;
//   const tr_y = options.y === 'center' ? 'translateY(-50%)' : null;
//   let transform = tr_x || tr_y ? [tr_x, tr_y].join(' ') : undefined;

//   const x = typeof options.x == 'number' ? options.x + 'px' : options.x === 'center' ? '50%' : options.x;
//   const y = typeof options.y == 'number' ? options.y + 'px' : options.y === 'center' ? '50%' : options.y;

//   const { style = {}, className, wrapper: Wrapper = DefaultWindowWrapper, wrapperprops = {} } = options;

//   // const dispatch = useDispatch();
//   // const { zIndexGlobal } = useSelector((state: RootState) => state.persistedReducer.counterSlice);
//   //const { zIndexGlobal, addZIndexGlobal } = useStoreRoot();
//   // Состояния
//   const [isDrag, setDrag] = useState(false);
//   const [zIndexValue, setZIndexValue] = useState(0);

//   const [isNewWindow, setIsNewWindow] = useState(true);

//   const [isFullScreen, setFullScreen] = useState(false);
//   // const [isWindowRoll,setIsWindowRoll] = useState(false);

//   // const isFullScreen = props.data.state.mode === "maximized";
//   const isWindowRoll = props.data.state?.mode === 'minimized';

//   const onFocusToChangeZIndex = () => {
//     // Проверка, чтобы не было лишних перерисовок
//     // if (zIndexValue <= zIndexGlobal) {
//     //   setZIndexValue(zIndexGlobal + 1);
//     //   addZIndexGlobal(1);
//     //   setIsNewWindow(false);
//     }
//   };
//   const onBlurSetOffDrag = () => {
//     //setDrag(false);
//   };

//   //const transformValueFramer = useMotionValue('translateX(0) translateY(0)');

//   return (
//     <Wrapper {...wrapperprops}>
//       <motion.div
//         onFocus={onFocusToChangeZIndex}
//         onBlur={onBlurSetOffDrag}
//         tabIndex={props.data.id}
//         drag={isDrag}
//         dragConstraints={props.constraintsRefProp}
//         dragMomentum={false}
//         ref={ref as any}
//         className={`${cl(styles.window, className)} rounded-md`}
//         style={
//           {
//             // '--w': !isFullScreen ? (typeof options.w == 'number' ? options.w + 'px' : options.w) : '100vw',
//             // '--h': !isFullScreen ? (typeof options.h == 'number' ? options.h + 'px' : options.h) : '96vh',
//             // // width: !isFullScreen ? (typeof options.w == "number" ? options.w + "px" : options.w) : "100vw",
//             // // height: !isFullScreen ? (typeof options.h == "number" ? options.h + "px" : options.h) : "96vh",
//             // zIndex: `calc(var(--z--windows) + ${isNewWindow ? zIndexGlobal : zIndexValue})`,
//             // //   left: x,
//             // //   top: y,
//             // transform: isFullScreen && transformValueFramer,
//             // // borderRadius: "10px",
//             // display: isWindowRoll && 'none',
//           } as any
//         }
//       >
//         {/* Хедер файл менеджера */}
//         <div
//           className=" bg-[#001529] text-white p-3"
//           // onMouseDown={() => setDrag(true)}
//           // onMouseOver={() => setDrag(true)}
//           onDoubleClick={() => {
//             setFullScreen(!isFullScreen);
//             // setState(props.data.id, {
//             //   mode: isFullScreen ? "normal" : "maximized",
//             // });
//           }}
//           onMouseMove={(event) => {
//             event.preventDefault();
//             setDrag(true);
//             if (isDrag && ref.current) {
//               const { movementX, movementY } = event;
//               const rect = ref.current.getBoundingClientRect();
//               const pos = { x: rect.x + movementX, y: rect.y + movementY };
//               const border = {
//                 top: 0,
//                 left: 0,
//                 bottom: window.innerHeight - (rect.bottom - rect.top),
//                 right: window.innerWidth - (rect.right - rect.left),
//               };
//               setOptions({
//                 ...options,
//                 ...MakePointInRect(pos, border),
//               });
//             }
//           }}
//         >
//           <SidedDiv>
//             <LeftSide>
//               <span className="font-bold py-1 px-2 bg-gray-800 rounded-lg">#{props.data.id}</span>{' '}
//               <span className="font-bold py-1 px-2 bg-gray-800 rounded-lg" title={`Window #${props.data.id}`}>
//                 {options.title}
//               </span>
//             </LeftSide>
//             <RightSide>
//               <Buttons>
//                 <Button
//                   className={styles.minimize_button}
//                   onClick={() => {
//                     // setIsWindowRoll(!isWindowRoll);
//                     setState(props.data.id, {
//                       mode: 'minimized',
//                     });
//                   }}
//                   compact
//                 >
//                   <svg fill="#868e96" height="512px" version="1.1" viewBox="0 0 512 512" width="512px" xmlSpace="preserve">
//                     <style type="text/css"></style>
//                     <g className="st1" id="layer">
//                       <line className="st0" x1="461" x2="51" y1="461" y2="461" />
//                     </g>
//                     <g id="layer_copy">
//                       <g>
//                         <path d="M461,469H51c-4.418,0-8-3.582-8-8s3.582-8,8-8h410c4.418,0,8,3.582,8,8S465.418,469,461,469z" />
//                       </g>
//                     </g>
//                   </svg>
//                 </Button>

//                 <Button
//                   className={styles.fullScreen_button}
//                   onClick={() => {
//                     setFullScreen(!isFullScreen);
//                     // setState(props.data.id, {
//                     //   mode: isFullScreen ? "normal" : "maximized",
//                     // });
//                   }}
//                   variant="outline"
//                   size="xs"
//                   compact
//                 >
//                   <svg height="18px" version="1.1" viewBox="0 0 18 18" width="18px">
//                     <g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1">
//                       <g fill="#868e96" id="Core" transform="translate(-3.000000, -87.000000)">
//                         <g id="check-box-outline-blank" transform="translate(3.000000, 87.000000)">
//                           <path
//                             d="M16,2 L16,16 L2,16 L2,2 L16,2 L16,2 Z M16,0 L2,0 C0.9,0 0,0.9 0,2 L0,16 C0,17.1 0.9,18 2,18 L16,18 C17.1,18 18,17.1 18,16 L18,2 C18,0.9 17.1,0 16,0 L16,0 L16,0 Z"
//                             id="Shape"
//                           />
//                         </g>
//                       </g>
//                     </g>
//                   </svg>
//                 </Button>
//                 <CloseButton
//                   className={styles.close_button}
//                   aria-label="Close modal"
//                   iconSize={24}
//                   onClick={(event) => {
//                     close(props.data.id);
//                     props.data.options.onClose && props.data.options.onClose(event);
//                   }}
//                 />
//               </Buttons>
//             </RightSide>
//           </SidedDiv>
//         </div>
//         {/* RESIZE */}
//         <div
//           onMouseDown={() => setDrag(false)}
//           className={styles.windowcontent}
//           //   onClick={() => console.log("asdasdasd")}
//           style={{
//             resize: 'both',
//             overflow: 'auto',
//             ...style,
//             width: isFullScreen ? '100vw' : 'var(--w)',
//             height: isFullScreen ? '96vh' : 'var(--h)',
//             zIndex: '10000',
//           }}
//         >
//           {props.data.content}
//         </div>
//       </motion.div>
//     </Wrapper>
//   );
// };




