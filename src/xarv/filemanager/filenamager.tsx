// import {
//   createContext,
//   useEffect,
//   useState,
//   useContext,
//   MouseEvent,
//   useRef,
//   ChangeEvent,
//   ReactNode,
//   MutableRefObject,
//   MouseEventHandler,
//   KeyboardEvent,
// } from 'react';

// import styles from './filenamager.module.scss';

// interface IFileManagerContext {
//   ref: MutableRefObject<any>;
//   path: string;
//   setPath(path: string): void;
//   openModal<Type>(menu: JSXComponent<Type>, data: Type, pos: IPoint): void;
//   closeModal(): void;
//   useMenu<Type>(menu: JSXComponent<Type>, data: Type): (event: any) => void;

//   renameFile(oldName: string, newName: string): void;
//   removeFile(path: string): void;

//   setStatus(text: string): void;
// }

// const FileManagerContext = createContext<IFileManagerContext>(null as any);
// export const useFileManager = () => useContext(FileManagerContext);

// function FilePath() {
//   const manager = useFileManager();

//   const { path, setPath } = manager;
//   const parts = path.split('/').slice(1);

//   function FilePathPart(props: { path: string }) {
//     // пока не трогай я сам уберу этот слеш
//     return (
//       <>
//         <span>/</span>
//         <span className={styles.crumb}>{props.path}</span>
//       </>
//     );
//   }

//   return (
//     <div className={styles.crumbs}>
//       {parts.map((part) => (
//         <FilePathPart key={part} path={part} />
//       ))}
//     </div>
//   );
// }

// interface IFileManagerProps {
//   path?: string;
// }

// function PreviewDir() {
//   /*здесь ести в компонениты не пихай куски свг*/
//   // return <>
//   //     <Image src='/images/filemamager/folder2.svg' width={140} height={140}  />
//   // </>
//   return (
//     <>
//       <svg
//         className={styles.folderIcon}
//         height="48"
//         viewBox="0 0 48 48"
//         width="48"
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <path d="M20 8h-12c-2.21 0-3.98 1.79-3.98 4l-.02 24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4v-20c0-2.21-1.79-4-4-4h-16l-4-4z" />
//         <path d="M0 0h48v48h-48z" fill="none" />
//       </svg>
//     </>
//   );
// }

// const mime2ext = {
//   'image/jpeg': '.jpeg',
//   'text/javascript': '.js',
//   // 'application/octet-stream': '.bin',
//   '*': '.unk',
// };

// function PreviewFile({ mime }: { mime?: string }) {
//   /*здесь ести в компонениты не пихай куски свг*/
//   // return <>
//   //     <Image src='/images/filemamager/folder2.svg' width={140} height={140}  />
//   // </>

//   return (
//     <div className={styles.fileIconWrapper}>
//       <span>{mime ? mime2ext[mime] ?? mime2ext['*'] ?? mime : '.hz'}</span>
//       <svg className={styles.fileIcon} height="24" viewBox="0 0 24 24" version="1.1" width="24">
//         <g transform="translate(0 -1028.4)">
//           <path
//             d="m5 1030.4c-1.1046 0-2 0.9-2 2v8 4 6c0 1.1 0.8954 2 2 2h14c1.105 0 2-0.9 2-2v-6-4-4l-6-6h-10z"
//             fill="#95a5a6"
//           />
//           <path
//             d="m5 1029.4c-1.1046 0-2 0.9-2 2v8 4 6c0 1.1 0.8954 2 2 2h14c1.105 0 2-0.9 2-2v-6-4-4l-6-6h-10z"
//             fill="#bdc3c7"
//           />
//           <path d="m21 1035.4-6-6v4c0 1.1 0.895 2 2 2h4z" fill="#95a5a6" />
//         </g>
//       </svg>
//     </div>
//   );
// }

// function HierarchyFile(props: IRecordProps) {
//   const { rec: file, path } = props;
//   const rel = file_path(path, file);
//   const url = statics.host.api + rel;
//   return (
//     <li className={styles.hierarchyLI + ' ' + styles.hierarchyFile}>
//       <a href={url}>
//         <span>{file.name}</span>
//       </a>
//     </li>
//   );
// }

// function HierarchySpoiler(props: IRecordProps) {
//   const { rec: file, path } = props;
//   const [isOpen, setOpened] = useState<boolean>(false);
//   const manager = useFileManager();
//   const rel = file_path(path, file);

//   const isOpenStyle = isOpen ? styles.open : styles.close;

//   function onDoubleClick(event: MouseEvent<HTMLSpanElement>) {
//     if (!isOpen) manager.setPath(rel);
//     setOpened(!isOpen);
//     event.preventDefault();
//     event.stopPropagation();
//   }

//   return (
//     <li className={styles.hierarchyLI + ' ' + styles.hierarchySpoiler + ' ' + isOpenStyle}>
//       <span className={styles['hierarchy-marker']}></span>
//       <PreviewDir />
//       <span onDoubleClick={onDoubleClick}>{file.name}</span>
//       {isOpen && <Hierarchy path={rel} />}
//     </li>
//   );
// }

// function HierarchyRecord(props: IRecordProps) {
//   const { rec, path } = props;

//   if (rec.type == 'file') {
//     return <></>; // <HierarchyFile rec={rec} path={path}/>
//   }

//   return <HierarchySpoiler rec={rec} path={path} />;
// }

// function file_path(path: string, { name: fname }: IFolderRecordData) {
//   return path == '/' ? path + fname : path + '/' + fname;
// }

// function Hierarchy(props: { path?: string }) {
//   const { path = '/' } = props;
//   const files = useFolder(); //  const {clear,fetch,list} = useFolder() | Как ссылка на функции

//   useEffect(() => {
//     files.clear();
//     files.fetch(path);
//   }, [path]);

//   return (
//     <>
//       <ul className={styles.hierarchy}>
//         {files.list.map((rec) => (
//           <HierarchyRecord key={rec.name} rec={rec} path={path} />
//         ))}
//       </ul>
//     </>
//   );
// }

// export interface IFolderRecordData {
//   name: string;
//   type: string;
//   mime?: string;
//   path: string;
//   token: string;
// }

// export interface IRecordProps {
//   rec: IFolderRecordData;
//   path: string;
// }

// interface IUseFolfer {
//   list: IFolderRecordData[];
//   add(file: IFolderRecordData): void;
//   remove(paths: string[]): void;
//   clear(): void;
//   fetch(path: string): Promise<void>;
//   rename(oldName: string, newName: string): void;
// }

// function RecordView(props: IRecordProps) {
//   const { rec: file, path } = props;
//   const { name, type, mime, token } = file;
//   const manager = useFileManager();

//   const rel = file_path(path, file);
//   const url = `${statics.host.api}/api/v1/vfiles/${token}`;

//   function onDoubleClick(event: MouseEvent<HTMLDivElement>) {
//     if (type == 'dir') {
//       manager.setPath(rel);
//     } else {
//       return OnClickClipboard(event, () => url);
//     }

//     event.stopPropagation();
//     return;
//   }

//   function getPreview({ type, mime }: any) {
//     if (type == 'dir') return <PreviewDir />;

//     const s_mime = mime ? mime.split('/') : ['*', '*'];
//     if (type == 'file') {
//       if (s_mime[0] == 'image') return <img src={url} width={140} height={140} alt={mime} />;
//     }
//     // <><div>{s_mime[0]}</div><div>{s_mime[1]}</div></>
//     const preview = mime ? <PreviewFile mime={mime} /> : 'No preview';
//     return <div>{preview}</div>;
//   }

//   const preview = getPreview({ type, mime });
//   const ext_idx = name.lastIndexOf('.');
//   const [ext, base] =
//     ext_idx == -1 ? [null, name] : [name.substring(ext_idx), name.substring(0, ext_idx)];

//   const [bgRename, setBgRename] = useState(false);
//   const [editMode, setEditMode] = useState<boolean>(false);
//   const onKeyDownValue = async (e: KeyboardEvent<HTMLInputElement>) => {
//     e.stopPropagation();
//     if (e.key === 'Escape') {
//       setEditMode(false);
//       return;
//     }
//     if (e.key === 'Enter') {
//       manager.renameFile(name, e.currentTarget.value);
//       setEditMode(false);
//       console.log(e.currentTarget.value);

//       const {
//         data: { message },
//         status,
//       } = await RemoteFile(token).rename(e.currentTarget.value);
//       if (status == 200) {
//         console.log(`Rename ${name}`);
//         // manager.removeFile(manager.path + '/' + name)
//         manager.setStatus('Ok: ' + message);
//       } else {
//         manager.setStatus('Error: ' + message);
//       }
//     }
//   };
//   const onDoubleClickBase = (e: MouseEvent<HTMLSpanElement>) => {
//     e.stopPropagation();

//     e.currentTarget;
//     console.log(e.currentTarget.innerText);
//     setEditMode(!editMode);
//   };

//   const name_part = editMode ? (
//     <>
//       <>
//         <input
//           className={styles.inputRename}
//           onKeyDown={onKeyDownValue}
//           defaultValue={name}
//           type="text"
//           autoFocus
//         />
//         <div onClick={() => setEditMode(false)} className={styles.renameBg}></div>
//       </>
//     </>
//   ) : (
//     <>
//       <span className={styles.name} onDoubleClick={onDoubleClickBase}>
//         <span className={styles.base}>{base}</span>
//         <span className={styles.ext}>{ext}</span>
//       </span>
//     </>
//   );

//   return (
//     <div
//       className={styles.record}
//       onDoubleClick={onDoubleClick}
//       title={url}
//       onContextMenu={manager.useMenu(RecordViewContextMenu, {
//         name,
//         type,
//         mime,
//         path: url,
//         token,
//         ren: () => setEditMode(true),
//       })}
//     >
//       <div className={styles.preview}>{preview}</div>
//       <>{name_part}</>
//     </div>
//   );
// }

// interface IFolderView {
//   path: string;
//   folder: IUseFolfer;
// }

// export async function dirFetch(path: string, init: RequestInit = {}): Promise<IFolderRecordData[]> {
//   try {
//     const response = await fetch(
//       `${statics.host.api}/api/v1/vfiles/ls${path}`,
//       Object.assign<RequestInit, RequestInit>({}, init),
//     );
//     const recs = (await response.json()) as IFolderRecordData[];
//     return recs.map((rec) => {
//       return { ...rec, path: path + '/' + rec.name };
//     });
//   } catch (error) {
//     console.error(error);
//   }

//   return [];
// }

// async function onFetch(path: string, cb: (_: IFolderRecordData[]) => void) {
//   /*if(path == '/'){
//         cb([
//             { name: 'File system', path: '/dir', type: 'dir' },
//             { name: 'Temp files', path: '/tmp', type: 'dir' },
//             { name: 'My files', path: '/my', type: 'dir' }
//         ])
//         return
//     }*/
//   cb(
//     await dirFetch(path, {
//       headers: {
//         ...h_Auth(),
//         ...h_JSON,
//       },
//     }),
//   );
//   return;
// }

// // custom hook
// function useFolder(): IUseFolfer {
//   const [list, set] = useState<IFolderRecordData[]>([]);

//   const arr = [1, 'asd']; // arr
//   const tuple = [1, 'asd'] as [number, string]; // картеж

//   function add(file: IFolderRecordData) {
//     set([...(list ?? []), file]);
//   }

//   function remove(paths: string[]) {
//     const files = [...(list ?? []).filter((file) => paths.indexOf(file.path) == -1)];
//     set(files);
//   }

//   function rename(oldName: string, newName: string) {
//     const renamed_files = list.map((file) => {
//       if (file.name == oldName) {
//         return { ...file, name: newName };
//       }
//       return file;
//     });
//     set([...renamed_files]);

//     // const old_file = list.find(file=>file.name == oldName) // map ()
//     // if(!old_file) return
//     // const filtered_files = [... (list ?? []).filter(file => file != old_file)]
//     // const files: IFolderRecordData[] = [ ...filtered_files, { ...old_file, name: newName }]
//     // set(files)
//     return;
//   }

//   const clear = () => set([]);
//   const fetch = async (path: string) => await onFetch(path, set);

//   // Экспорт функций
//   return { list, add, remove, clear, fetch, rename };
// }

// function ParentFolder() {
//   const manager = useFileManager();

//   const up = () => {
//     const parts = manager.path.split('/');
//     const back = parts.slice(1, parts.length - 1);
//     const path = '/' + back.join('/');
//     manager.setPath(path);
//   };

//   return (
//     <>
//       <Button className={styles.buttonup} onClick={up}>
//         <span> ⮤</span>
//       </Button>
//     </>
//   );
// }

// function NewFolder() {
//   const manager = useFileManager();

//   const add = () => {
//     const parts = manager.path.split('/');
//     const back = parts.slice(1, parts.length - 1);
//     const path = '/' + back.join('/');
//     manager.setPath(path);
//   };

//   return (
//     <>
//       <Button className={styles.buttonup} onClick={add}>
//         New
//       </Button>
//     </>
//   );
// }

// export async function uploadForm(form: HTMLFormElement): Promise<any> {
//   try {
//     const res = await fetch(form.action, {
//       method: 'POST',
//       headers: {
//         ...h_Auth(),
//       },
//       body: new FormData(form),
//     });
//     const json = await res.json();
//     console.log({ json });
//     return json;
//   } catch (error) {
//     console.error(error);
//   }

//   return [];
// }

// export async function uploadFiles(
//   url: string,
//   files: FileList,
//   name: string = 'files',
// ): Promise<any> {
//   try {
//     const data = new FormData();
//     const a_files = Array.from(files);
//     a_files.forEach((file) => data.append(name, file));
//     // data.append(`${name}`, a_files)
//     console.log({ data, files, a_files, name });

//     const res = await fetch(url, {
//       method: 'POST',
//       headers: {
//         ...h_Auth(),
//       },
//       body: data,
//     });
//     const json = await res.json();
//     console.log({ json });
//     return json;
//   } catch (error) {
//     console.error(error);
//   }

//   return [];
// }

// interface IUploaderProps {
//   onUpload?: () => void;
// }

// export function Uploader(props: IUploaderProps) {
//   const manager = useFileManager();
//   const ref = useRef<any>();
//   const [upload_list, setUploadList] = useState<FileList | null>(null);

//   async function sendFiles(files: FileList) {
//     const r_files = await uploadFiles(
//       `${statics.host.api}/api/v1/vfiles${manager.path}`,
//       files,
//       'files',
//     );
//     const path = manager.path;
//     manager.setPath('/');
//     manager.setPath(path);
//   }

//   async function onClick(event: MouseEvent<HTMLButtonElement>) {
//     await sendFiles(ref.current.files);
//     props.onUpload && props.onUpload();
//     setUploadList(null);
//     event.preventDefault();
//     event.stopPropagation();
//   }

//   function onClickBrowse(event: MouseEvent<HTMLButtonElement>) {
//     ref.current && (ref.current as HTMLInputElement).click();
//     event.stopPropagation();
//   }

//   function UploadFile(props: { file: File }) {
//     const { name, size, type } = props.file;
//     return (
//       <div className={styles.uploadRecord}>
//         <span>Name: {name}</span>
//         <span>Size: {size}</span>
//         {type && <span>Type: {type}</span>}
//       </div>
//     );
//   }

//   function UploadFilesList(props: { files: FileList }) {
//     return (
//       <div className={styles.uploadRecords}>
//         {Array.from(props.files).map((file) => (
//           <UploadFile key={file.name} file={file} />
//         ))}
//       </div>
//     );
//   }

//   function onChangeUploadList(event: ChangeEvent<HTMLInputElement>) {
//     setUploadList(event.currentTarget.files);
//   }

//   return (
//     <>
//       <input ref={ref} type="file" name="files" multiple hidden onChange={onChangeUploadList} />
//       <div>{upload_list && <UploadFilesList files={upload_list} />}</div>
//       <Buttons className={styles.buttons}>
//         <Button className={styles.browse} onClick={onClickBrowse}>
//           Browse
//         </Button>
//         <Button className={styles.upload} onClick={onClick}>
//           Upload
//         </Button>
//       </Buttons>
//     </>
//   );
// }

// interface IPoint {
//   x: number;
//   y: number;
// }

// interface IModalProps<PropsType = any> {
//   pos: IPoint;
//   props: PropsType;
//   element(props: PropsType): JSX.Element;
// }

// function Modal(modal: IModalProps) {
//   const { element: Element, props = {}, pos = { x: 0, y: 0 } } = modal;
//   const { x, y } = pos;

//   return (
//     <div className={styles.modalWrapper}>
//       <div className={styles.modal} style={{ left: `${x}px`, top: `${y}px` }}>
//         <Element {...props} />
//       </div>
//     </div>
//   );
// }

// function onContextMenu<Type>(
//   event: MouseEvent<HTMLElement>,
//   manager: IFileManagerContext,
//   menu: JSXComponent<Type>,
//   data: Type,
// ) {
//   const manager_element = manager.ref.current as HTMLDivElement;
//   const m_rect = manager_element.getBoundingClientRect();

//   const pos: IPoint = {
//     x: event.clientX - m_rect.left,
//     y: event.clientY - m_rect.top - m_rect.height,
//   };

//   manager.openModal(menu, data, pos);
//   event.preventDefault();
//   event.stopPropagation();
// }

// function ContentViewContextMenu() {
//   const manager = useFileManager();

//   return (
//     <ul className={styles.ctxmenu_ul} onClick={() => manager.closeModal()}>
//       <li>Select all</li>
//       <li>New folder</li>
//     </ul>
//   );
// }

// class RemoteFileHandle {
//   token: string;

//   constructor(token: string) {
//     this.token = token;
//   }

//   // Удаление запрос
//   async delete() {
//     const res = await fetch(`${statics.host.api}/api/v1/vfiles/rm/${this.token}`, {
//       method: 'POST',
//       headers: {
//         ...h_Auth(),
//       },
//     });
//     const json = await res.json();
//     console.log({ json });
//     return { data: json, status: res.status };
//   }

//   // Переименование запрос
//   async rename(newName: string) {
//     const res = await fetch(`${statics.host.api}/api/v1/vfiles/rn/${this.token}`, {
//       method: 'POST',
//       headers: {
//         ...h_Auth(),
//       },
//       body: JSON.stringify({ name: newName }),
//     });
//     const json = await res.json();
//     console.log({ json });
//     return { data: json, status: res.status };
//   }
// }

// const RemoteFile = (token: string) => new RemoteFileHandle(token);

// function RecordViewContextMenu(props: IFolderRecordData & { ren: () => void }) {
//   const manager = useFileManager();

//   // картеж, классы

//   const actions: [JSX.Element, MouseEventHandler?][] = [
//     [
//       <>Rename</>,
//       async () => {
//         console.log(`Rename ${props.name}`);
//         props.ren();
//       },
//     ], // переделать на useContext
//     [
//       <>Delete</>,
//       async () => {
//         try {
//           const {
//             data: { message },
//             status,
//           } = await RemoteFile(props.token).delete();
//           if (status == 200) {
//             console.log(`Delete ${props.name}`);
//             manager.removeFile(manager.path + '/' + props.name);
//             manager.setStatus('Ok: ' + message);
//           } else {
//             manager.setStatus('Error: ' + message);
//           }
//         } catch (error) {
//           if (error instanceof Error) console.log(error.stack);
//           manager.setStatus('Net error');
//         }
//       },
//     ],

//     [
//       <ClipboardCopy key={'ClipboardCopy'} cb={() => props.path}>
//         Copy URL
//       </ClipboardCopy>,
//     ],
//   ];

//   const jsx_actions = actions.map(([element, action], index) => (
//     <li key={index} onClick={action}>
//       {element}
//     </li>
//   ));

//   return (
//     <ul className={styles.ctxmenu_ul} onClick={() => manager.closeModal()}>
//       {jsx_actions}
//     </ul>
//   );
// }

// function ContentView(props: IFolderView) {
//   const manager = useFileManager();
//   const { folder, path } = props;
//   const { list } = folder;

//   return (
//     <>
//       <div className={styles.content} onContextMenu={manager.useMenu(ContentViewContextMenu, {})}>
//         {list.map((file) => (
//           <RecordView key={file.path} rec={file} path={path} />
//         ))}
//       </div>
//     </>
//   );
// }

// type JSXComponent<Type = any> = (props: Type) => JSX.Element;
// const null_jsx: JSXComponent = () => <></>;
// const null_modal = { element: null_jsx, props: {}, pos: { x: 0, y: 0 } };

// export function FileManager(props: IFileManagerProps) {
//   const [path, setPath] = useState(props.path ?? '/');
//   const [status, setStatus] = useState('');
//   const folder = useFolder();
//   const ref = useRef<any>();

//   const [contextMenu, setContextMenu] = useState<IModalProps>(null_modal);

//   const manager: IFileManagerContext = {
//     ref,
//     path,
//     setPath,
//     openModal: (element, props, pos) => setContextMenu({ element, props, pos }),
//     closeModal: () => setContextMenu(null_modal),
//     useMenu: (menu, data) => (event) => onContextMenu(event, manager, menu, data),
//     setStatus,
//     removeFile: (path) => {
//       folder.remove([path]);
//     },

//     renameFile: (oldName: string, newName: string) => {
//       folder.rename(oldName, newName);
//     },
//   };

//   useEffect(() => {
//     folder.clear();
//     folder.fetch(path);
//   }, [path]);

//   function onClick(event: MouseEvent) {
//     manager.closeModal();
//     event.stopPropagation();
//   }

//   return (
//     <>
//       <FileManagerContext.Provider value={manager}>
//         <div ref={ref} className={styles.wrapper} onClick={onClick}>
//           <p className={styles.title}>File manager</p>
//           <header className={styles.header}>
//             <Buttons className={styles.buttons}>
//               <ParentFolder /> {/*<NewFolder/>*/}
//             </Buttons>
//             <FilePath />
//           </header>
//           <main className={styles.main}>
//             <Hierarchy path="/" />
//             <ContentView folder={folder} path={path} />
//           </main>
//           <footer className={styles.footer}>
//             <Uploader />
//             <span>{status}</span>
//           </footer>
//         </div>
//         <Modal {...contextMenu} />
//       </FileManagerContext.Provider>
//     </>
//   );
// }

// async function OnClickClipboard(event: MouseEvent, cb: () => string) {
//   const path = cb();
//   if (navigator.clipboard) {
//     await navigator.clipboard.writeText(path);
//     console.log(`clipboard_copied: ${path}`);
//   } else {
//     alert(`clipboard_passed: ${path}`);
//   }
//   // event.stopPropagation()
// }

// export function ClipboardCopy(props: { children?: ReactNode; cb: () => string }) {
//   return <div onClick={(event) => OnClickClipboard(event, props.cb)}>{props.children}</div>;
// }
