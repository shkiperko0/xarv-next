/* eslint-disable @next/next/no-img-element */
import {
	useState,
	useEffect,
	useRef,
	useContext,
	createContext,
	ChangeEvent,
	MouseEvent,
	MouseEventHandler,
	KeyboardEvent,
	KeyboardEventHandler,
	ReactNode,
	Dispatch,
	SetStateAction,
	DragEventHandler,
	HTMLAttributes,
	useMemo,
} from "react";

import { cl } from "src/xarv/plain/utils";
import { Button, Buttons } from "src/xarv/components/button";

import { IFile } from "../types";
import { CFileManagerProvider, getRelativeFullPath } from "../provider";
import styles from "./styles.module.scss";
import { useAsyncEffect, useEventer } from "src/xarv/hooks";


import { createEventer } from "src/xarv/plain/utils/eventer";
import { useWindows } from "../../taskmanager";
import { useId } from "src/xarv/hooks/useId";

interface IFileProps {
	file: IFile
}

type TFileActionElement = JSX.Element | ((props: IFileProps) => JSX.Element)
type JSXComponent<Type = any> = (props: Type) => JSX.Element;

type IUseFolder = {
    list: IFile[]
    add(file: IFile | IFile[]): void
    remove(files: IFile | IFile[]): void
    rename(file: IFile, newName: string): void
    clear(): void
    set: Dispatch<SetStateAction<IFile[]>>
}

function useFolder(): IUseFolder {
	const [list, set] = useState<IFile[]>([]);
	return { 
		list,
		add(file: IFile | IFile[]) { 
			set(list => [...list, ...(file instanceof Array ? file : [file]) ]) 
		},
		
		remove(files: IFile | IFile[]) { 
			console.log({list, files})
			set(list => list.filter(del => {

				if(files instanceof Array){
					const find = files.find(file => del.name == file.name)
					return find !== undefined
				}

				return del.name != files.name
			}))
		},

		rename(file: IFile, name: string) { 
			set(list => list.map(rename => { 
				if(file.name === rename.name){
					return { ...rename, name }
				} 
				return rename
			})) 
		},

		clear(){ set([]) },
		set
	};
}

function FilePath() {
	const manager = useFileManager();

	const { path, setPath } = manager;
	const parts = path.split("/").slice(1);

	function FilePathPart(props: { path: string }) {
		// пока не трогай я сам уберу этот слеш
		return (
			<>
				<span>/</span>
				<span className={styles.crumb}>{props.path}</span>
			</>
		);
	}

	return (
		<div className={styles.crumbs}>
			{parts.map((part) => (
				<FilePathPart key={part} path={part} />
			))}
		</div>
	);
}

function HierarchyFile(props: IFileProps) {
	const { file } = props;
	const rel = getRelativeFullPath(file);
	// const url = statics.host.api + rel;
	return (
		<div className={styles.hierarchyLI + " " + styles.hierarchyFile}>
			<span className={styles.noneMarker}/>
			<FileIcon/>
			{/* <a href={url}> */}
				<span>{file.name}</span>
			{/* </a> */}
		</div>
	);
}

function HierarchySpoiler(props: IFileProps) {
	const { file } = props;
	const [isOpen, setOpened] = useState<boolean>(false);
	const manager = useFileManager();
	const path = getRelativeFullPath(file);

	const isOpenStyle = isOpen ? styles.open : styles.close;
	const isCurrent = path == manager.path

	function onDoubleClick(event: MouseEvent<HTMLSpanElement>) {
		if (!isOpen) manager.setPath(path);
		setOpened(!isOpen);
		event.preventDefault();
		event.stopPropagation();
	}

	return (
		<div className={cl(styles.hierarchyLI, styles.hierarchySpoiler, isOpenStyle)}>
			<span className={styles["hierarchy-marker"]}></span>
			<DirIcon fill={isCurrent ? 'red' : undefined} />
			<span onDoubleClick={onDoubleClick}>{file.name}</span>
			{ isOpen && <DirectoryHierarchy path={path} /> }
		</div>
	);
}

function HierarchyItem(props: IFileProps) {
	const { file } = props;

	if (file.type != 'dir') {
		return <li>
			{/* hierarhy not available for non directory*/}
			<HierarchyFile file={file}/>
		</li>
	}

	return <li>
		<HierarchySpoiler file={file} />
	</li>
}

function HierarchyList({
	children,
	className
}: {
	className?: string
	children: ReactNode
}){
	return <ul className={className}>{children}</ul>
}

function DirectoryHierarchy(props: { path?: string }) {
	const manager = useFileManager();
	const { path = "/" } = props;
	const folder = useFolder();

	useAsyncEffect(async () => {
		await manager.WithExceptionFilter(async (manager, ok) => {
			const res = await manager.provider.list(path)
			const { status, ...other } = res
			if(status === 200){
				folder.set(res.list);
				ok()
			}else{
				manager.setStatus('a')
			}
		})
	}, [path]);

	return <HierarchyList className={styles.hierarchy}>
		{
			folder.list.map(
				(file) => <HierarchyItem key={file.name} file={file} />
			)
		}
	</HierarchyList>
}

function DirIcon({ fill="#525252" }: { fill?: string }){
	return <svg className={styles.folderIcon} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
		<path d="M20 8h-12c-2.21 0-3.98 1.79-3.98 4l-.02 24c0 2.21 1.79 4 4 4h32c2.21 0 4-1.79 4-4v-20c0-2.21-1.79-4-4-4h-16l-4-4z" fill={fill}/>
		<path d="M0 0h48v48h-48z" fill='none'/>
	</svg>
}

function PreviewDir({ className }: IPreviewProps) {
	return <div className={className}>
		<DirIcon/>
	</div>
}

const MimeExtentionMap/*: { 
	readonly [name: string]: ReactNode
}*/ = {
	"application/javascript": <div>JS</div>,
	"text/plain": <div>TXT</div>,
	"application/octet-stream": <div>BIN</div>,
	"video/mp4": <div>MP4</div>,
	"video/*": <div>Video</div>,
	"*": <div>unk</div>
} as const;

type MimeExtentionMapKey = keyof typeof MimeExtentionMap

const getExtentionWatermark = (mime_type?: MimeExtentionMapKey): ReactNode => {
	if(mime_type === undefined){
		return MimeExtentionMap['*']
	}

	if(MimeExtentionMap[mime_type] === undefined){
		const [type, _] = mime_type.split('/')
		mime_type = `${type}/*` as MimeExtentionMapKey;
		if(MimeExtentionMap[mime_type] !== undefined){
			return MimeExtentionMap[mime_type]
		}
	}else{
		return MimeExtentionMap[mime_type]
	}
	
	return MimeExtentionMap['*']
}

function MimeWatermark({ mime_type }: { mime_type?: string }){
	let element = getExtentionWatermark(mime_type as MimeExtentionMapKey)
	return <span className={styles.extWaterMark}>{element}</span>
}

function FileIcon(){
	return <svg className={styles.fileIcon} viewBox="0 0 24 24" version="1.1">
		<g transform="translate(0 -1028.4)">
			<path d="m5 1030.4c-1.1046 0-2 0.9-2 2v8 4 6c0 1.1 0.8954 2 2 2h14c1.105 0 2-0.9 2-2v-6-4-4l-6-6h-10z" fill="#95a5a6" />
			<path d="m5 1029.4c-1.1046 0-2 0.9-2 2v8 4 6c0 1.1 0.8954 2 2 2h14c1.105 0 2-0.9 2-2v-6-4-4l-6-6h-10z" fill="#bdc3c7" />
			<path d="m21 1035.4-6-6v4c0 1.1 0.895 2 2 2h4z" fill="#95a5a6" />
		</g>
	</svg>
}

function PreviewFile({ file, className }: IPreviewProps & IFileProps) {
	const { provider } = useFileManager()
	const { mime_type } = file
	const url = provider.link(file);

	if (mime_type) {
		const [type, subtype] = mime_type.split("/");
		if (type == "image") {
			return <img className={styles.thumbnail} src={url} alt={mime_type} />;
		}
	}

	return (
		<div className={cl(className, styles.fileIconWrapper)}>
			<MimeWatermark mime_type={mime_type}/>
			<FileIcon/>
		</div>
	);
}

interface IPreviewProps {
	className?: string
}

function NoPreview({ className }: IPreviewProps) {
	return <div className={className}>No preview</div>;
}

function PreviewManager(props: IFileProps) {
	const { file } = props;
	const { type } = file

	const className = cl(styles.preview, styles.thumbnail)

	if (type == "dir")
		return <PreviewDir className={className} />

	if (type == "file")
		return <PreviewFile className={className} file={file} />

	return <NoPreview className={className} />
}

function FileName(props: IFileProps & {
	mode: 'default' | 'edit'
	onClick?: MouseEventHandler
	onDoubleClick?: MouseEventHandler
	onKeyDown?: KeyboardEventHandler
}) {
	const { mode, file: { name, mime_type }, onClick, onDoubleClick, onKeyDown } = props

	const ext_idx = name.lastIndexOf(".");
	const [ext, base] = ext_idx == -1 ? [null, name] : [name.substring(ext_idx), name.substring(0, ext_idx)];

	if (mode == 'edit') {
		return <>
			<input className={styles.inputRename} onKeyDown={onKeyDown} defaultValue={name} type="text" autoFocus />
			<div onClick={onClick} className={styles.renameBg}></div>
		</>
	}

	// default mode
	return <>
		<span title={name} className={cl(styles.name, styles.filename)} onDoubleClick={onDoubleClick}>
			<span className={styles.base}>{base}</span>
			<span className={styles.ext}>{ext}</span>
		</span>
	</>
}

function RecordView(props: IFileProps) {
	const { file } = props;
	const { type, mime_type } = file;
	const [editMode, setEditMode] = useState<boolean>(false);
	const manager = useFileManager();
	
	const url = getRelativeFullPath(file);
	const { provider } = manager

	const startEdit = () => setEditMode(true)
	const stopEdit = () => setEditMode(false)
	const toggleEdit = () => setEditMode(toggle => !toggle)

	function onDoubleClick(event: MouseEvent<HTMLDivElement>) {
		if (type == "dir") {
			manager.setPath(url);
		} else {
			if (manager.mode == 'selectImage' && manager.triggers) {
				if (manager.triggers.onSelectImage) {
					manager.triggers.onSelectImage(file)
					return
				}
			}
			return OnClickClipboard(event, () => url);
		}
		event.stopPropagation();
		return;
	}

	const onKeyDownValue = async (e: KeyboardEvent<HTMLInputElement>) => {
		e.stopPropagation();
		if (e.key === "Escape") {
			stopEdit();
			return;
		}
		if (e.key === "Enter") {
			await manager.WithExceptionFilter(async (manager, ok) => {
				const newName = e.currentTarget.value
				const res = await manager.provider.rename(file, newName)
				stopEdit();
				if (res.status === 200) {
					manager.folder.rename(file, newName);
					ok()
				}else{
					const { message } = await res.json() as { message: string }
					ok()
					throw Error(message)
				}
			})
		}
	};

	const windows = useWindows()

	const ErrorMessagBox = (message: string) => {
		windows.open({
			title: 'Error',
			Render: ({window}) => <>
				{message}
				<Button onClick={() => windows.close(window.id)}>Ok</Button>
			</>
		})
	}

	const onDoubleClickBase = (e: MouseEvent<HTMLSpanElement>) => {
		e.stopPropagation();
		e.currentTarget;
		toggleEdit();
	};

	const RecordViewContextMenu = () => {
		return <ActionList>
			<FileRenameAction key={0} file={file} onTrigger={() => startEdit()} />
			<FileDeleteAction key={1} file={file} />
			<ClipboardCopy file={file} onCopy={() => provider.link(file)}>Copy Download URL</ClipboardCopy>
			{/* <ClipboardCopy file={file} onCopy={() => PublicFileManagerProvider.link(file)}>Copy Public Download URL (User Gate)</ClipboardCopy> */}
			{/* <ClipboardCopy file={file} onCopy={() => getRelativeFullPath(file)}>Copy Relative URL</ClipboardCopy> */}
		</ActionList>
	}

	return (
		<div
			className={styles.record}
			onDoubleClick={onDoubleClick}
			title={type == 'file' ? mime_type : 'folder'}
			onContextMenu={manager.useMenu(<RecordViewContextMenu/>)}
		>
			<PreviewManager file={file} />
			<FileName
				mode={editMode ? 'edit' : 'default'}
				file={file}
				onClick={stopEdit}
				onDoubleClick={onDoubleClickBase}
				onKeyDown={onKeyDownValue}
			/>
		</div>
	);
}

function ParentFolderButton() {
	const manager = useFileManager();

	const up = () => {
		const parts = manager.path.split("/");
		const back = parts.slice(1, parts.length - 1);
		const path = "/" + back.join("/");
		manager.setPath(path);
	};

	return (
		<>
			<Button className={styles.buttonup} onClick={up}>
				<span> ⮤</span>
			</Button>
		</>
	);
}

function RefreshButton() {
	const manager = useFileManager();
	return (
		<>
			<Button 
				className={styles.buttonup} 
				onClick={() => { 
					manager.setPath(manager.path)  
				}}
			>
				<span> ⟳</span>
			</Button>
		</>
	);
}

interface IUploaderProps {
	onUpload?: () => void;
}

function isFilesEq(a: File, b: File): boolean {
	return (a.name == b.name) && (a.size == b.size) && (a.type == b.type)
}

function FilesUniqFilter(files: File[]): File[] {
	let last_index = 0
	return files.filter((filter_file, index) => {
		const find_index = files.findIndex((find_file, index) => {
			const b = find_file != filter_file && isFilesEq(find_file, filter_file) && last_index > index
			return b
		})
		last_index = index
		return find_index === -1
	})
}

function UploadFile({file, onRemove}: { 
		file: File,
	 	onRemove(): void 
	}) {
		
	const { name, size, type } = file;
	return (
		<div className={styles.uploadRecord}>
			<span>Name: {name}</span>
			<span>Size: {size}</span>
			{type && <span>Type: {type}</span>}
			<Button onClick={() => onRemove()}>X</Button>
		</div>
	);
}

const ev = createEventer<{onChangeFiles(files: File[]): void}>()

function UploadFilesList(props: { files: File[] }) {
	const windows = useWindows()
	const manager = useFileManager()
	const id = useId()
	const event = 'onChangeFiles' + id as 'onChangeFiles'

	useEffect(() => { ev.trigger(event, manager.upload) }, [manager.upload, event])
	
	const openFileList = () => windows.open({
		title: 'Upload files',
		Render: ({window}) => { 
			const [files, setFiles] = useState(manager.upload)
			useEventer(ev, event, files => { !files.length ? windows.close(window.id) : setFiles(files) })

			return <FileManagerContext.Provider value={manager}>
				<div className={styles.uploadRecords}>
					{
						Array.from(files).map(
							(file) => <UploadFile 
								key={file.webkitRelativePath} 
								file={file} 
								onRemove={() => {
									manager.setUpload((files: File[]) => {
										const filtered = files.filter(ffile => !isFilesEq(ffile, file))
										setFiles(filtered)
										return filtered
									}) 

									if(files.length == 1) windows.close(window.id)
								}}
							/>
						)
					}
				</div>
			</FileManagerContext.Provider>
		},
	})

	return <>
		{ 
			manager.upload.length > 0 && 
			<Button className={styles.list} onClick={event => openFileList()}>
				List
			</Button>
		}
	</>
}

export function Uploader(props: IUploaderProps) {
	const manager = useFileManager();
	const ref = useRef<any>();
	const { upload, setUpload } = manager;

	// Отправка файла
	async function sendFiles(files: File[]) {
		await manager.WithExceptionFilter(async (manager, ok) => {
			const res = await manager.provider.upload(manager.path, files, "files");
			if(res.status === 200){
				ok()
				manager.folder.add(Array.from(files).map(file => ({
					name: file.name,
					path: manager.path,
					type: 'file',
					mime_type: file.type,
					size: file.size
				})))
			}
		})
	}

	async function onClick(event: MouseEvent<HTMLButtonElement>) {
		await sendFiles(upload);
		props.onUpload && props.onUpload();
		setUpload([]);
		event.preventDefault();
		event.stopPropagation();
	}

	function onClickBrowse(event: MouseEvent<HTMLButtonElement>) {
		ref.current && (ref.current as HTMLInputElement).click();
		event.stopPropagation();
	}

	function onChangeUploadList(event: ChangeEvent<HTMLInputElement>) {
		setUpload(files => FilesUniqFilter([ ...files, ...Array.from(event.currentTarget.files ?? [])]))
	}

	return (
		<>
			<input ref={ref} type="file" name="files" multiple hidden onChange={onChangeUploadList} />
			<Buttons className={styles.buttons}>
				<Button className={styles.browse} onClick={onClickBrowse}>
					Browse
				</Button>
				<Button className={styles.upload} onClick={onClick}>
					Upload
				</Button>
				<UploadFilesList files={upload} />
			</Buttons>
		</>
	);
}

interface IPoint {
	x: number;
	y: number;
}

interface IMenu<Type = any> {
	pos: IPoint;
	element: JSX.Element;
}

interface IModalMenuProps<Type = any> {
	menu: IMenu<Type>
}

function ModalMenu({ menu }: IModalMenuProps) {
	//if(menu === undefined) return <></>
	const { element, pos } = menu;
	const { x, y } = pos;

	return (
		<div className={styles.modalWrapper}>
			<div className={styles.modal} style={{ left: `${x}px`, top: `${y}px` }}>
				{element}
			</div>
		</div>
	);
}

function ContentViewContextMenu() {
	const manager = useFileManager();

	const addFile = async () => {
		const defaultName = 'new'
		let [name, path] = [defaultName, manager.path]
		let index = 0
		
		const nextName = () => {
			return (name = defaultName + ` (${++index})`)
		}

		const conflict = () => {
			for(const file of manager.folder.list){
				if(file.name === name){
					return true
				}	
			}
			return false
		}

		while(conflict()) nextName()

		const file: IFile = {
			name, path,
			type: 'dir'
		}

		await manager.WithExceptionFilter(async (manager, ok) => {
			const res = await manager.provider.mkdir(getRelativeFullPath(file));
			if(res.status === 200){
				manager.folder.add(file)
			 	ok()
			}else{
				ok()
				const { message } = await res.json() as { message: string }
				throw Error(message)
			}
		})

	};

	return <ActionList>
		{/* <li>Select all</li> */}
		<ActionItem onClick={addFile} >New folder</ActionItem>
	</ActionList>
}

interface IFileActionElementProps extends IFileProps {
	onTrigger?(): void
}

const FileRenameAction = (props: IFileActionElementProps) => {
	const { file, onTrigger = () => { } } = props
	return <ActionItem onClick={() => onTrigger && onTrigger()}>
		<span>Rename</span>
	</ActionItem>
}

const FileDeleteAction = (props: IFileProps) => {
	const { file } = props
	const manager = useFileManager()
	const { provider, folder } = manager

	const onClick: MouseEventHandler = async () => {
		await manager.WithExceptionFilter(async (manager, ok) => {
			const res = await manager.provider.delete(file)
			if(res.status === 200){
				manager.folder.remove(file)
				ok()
			}else{
				ok()
				const { message } = await res.json() as { message: string }
				throw Error(message)
			}
		})
	}

	// try {
	//   const {
	//     data: { message },
	//     status,
	//   } = await RemoteFile(props.token).delete();
	//   if (status == 200) {
	//     console.log(`Delete ${props.name}`);
	//     manager.removeFile(manager.path + "/" + props.name);
	//     manager.setStatus("Ok: " + message);
	//   } else {
	//     manager.setStatus("Error: " + message);
	//   }
	// } catch (error) {
	//   if (error instanceof Error) console.log(error.stack);
	//   manager.setStatus("Net error");
	// }

	return <ActionItem onClick={onClick}>
		<span>Delete</span>
	</ActionItem>
}

function ActionList(props: {
	className?: string
	children: ReactNode
}) {
	const { children, className } = props
	const manager = useFileManager();
	return <ul
		className={cl(styles.ctxmenu_ul, className)}
		onClick={() => manager.closeModal()}
	>
		{children}
	</ul>
}

function ActionItem({ 
	children, 
	className, 
	onClick
 }: {
	className?: string
	children: ReactNode
	onClick: MouseEventHandler
}) {
	return <li 
		className={className} 
		onClick={onClick}
	>
		{children}
	</li>
}

function RecordViewContextMenu(props: IFileProps & { actions: TFileActionElement[] }) {
	const { file, actions } = props
	const { provider } = useFileManager()

	const Unfolder = ({ element: Element }: { element: TFileActionElement }): JSX.Element => {
		if (typeof Element === 'function') {
			return <Element file={file} />
		}
		return Element
	}

	return (
		<ActionList>
			{
				actions.map(
					(element, index) => <Unfolder key={index} element={element} />
				)
			}
		</ActionList>
	);
}

type PromiseOpt<T = any> = Promise<T> | T

interface IDropZoneProps extends HTMLAttributes<HTMLDivElement> {
	onFiles?(files: File[]): PromiseOpt<void>
}

function DropZone({ onFiles, ...props }: IDropZoneProps) {

	const getFiles = (dataTransfer: DataTransfer): File[] => {
		if (dataTransfer.items) {
			return Array.from(dataTransfer.items)
				.filter(({kind}) => kind === 'file')
				.map(item => item.getAsFile()!)
		}
		return Array.from(dataTransfer.files)
	}

	const onDragOver: DragEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault();
	}

	const onDrop: DragEventHandler<HTMLDivElement> = (event) => {
		event.preventDefault();
		const files = getFiles(event.dataTransfer)
		console.log({files})
		onFiles && onFiles(files)
	} 

	return <div {...props} {...{onDragOver, onDrop}} />
}

// function FilterUniqFiles(files: File[]){
// 	return files.filter(file => )
// }

function ContentView() {
	const manager = useFileManager();

	return <DropZone className={styles.contentwrapper} onFiles={upload => { manager.setUpload(files => [...files, ...upload]) }}>
		<div className={styles.content} onContextMenu={manager.useMenu(<ContentViewContextMenu/>)}>
			{
				manager.folder.list.map((file) => <RecordView key={getRelativeFullPath(file)} file={file} />)
			}
		</div>
	</DropZone>
}

interface IFileManagerProps {
	provider: CFileManagerProvider
	path?: string
	mode?: 'selectImage',
	triggers?: {
		onSelectImage?(file: IFile): void 
	} 
}

type IFileManagerContext = ReturnType<typeof useFileManagerCore>
const FileManagerContext = createContext<IFileManagerContext>(null as any);

const useFileManagerCore = ({ path: startPath, provider , mode, triggers} : { path: string, provider: CFileManagerProvider,mode:IFileManagerProps['mode'],triggers:IFileManagerProps['triggers'] }) => {
	const [path, setPath] = useState<string>(startPath);
	const [status, setStatus] = useState("");
	const folder = useFolder();

	const [upload, setUpload] = useState<File[]>([]);

	const [contextMenu, setContextMenu] = useState<IMenu<never> | null>(null);
	const ref = useRef<any>();

	const openModal = (element: JSX.Element, pos: IPoint) => setContextMenu({ element, pos })
	const closeModal = () => setContextMenu(null)

	const useMenu = (element: JSX.Element) => (event: MouseEvent<HTMLElement>) => {
		const manager_element = ref.current as HTMLDivElement;
		const m_rect = manager_element.getBoundingClientRect();
	
		const pos: IPoint = {
			x: event.clientX - m_rect.left,
			y: event.clientY - m_rect.top - m_rect.height,
		};
	
		openModal(element, pos);
		event.preventDefault();
		event.stopPropagation();
	}

	const impl = {
		ref,
		mode,
		triggers,
		path, setPath,
		status, setStatus,
		contextMenu, setContextMenu,
		provider, folder,
		openModal, closeModal, useMenu,
		upload, setUpload,

		async WithExceptionFilter(this, callback: (manager: typeof this, ok: Function) => (Promise<void> | void) ) {
			const limit = 10
			for(let i = 0; i < limit; i ++){
				const ok = () => { i = limit } 
				try{
					const res = callback(this, ok)
					return res instanceof Promise ? (await res) : res 
				}
				catch(error){
					if(error instanceof Error){
						this.setStatus(error.message)	
					}else{
						this.setStatus(JSON.stringify(error))
					}
				}
			}
		}
	}

	const setPathHook = async (newPath: string) => impl.WithExceptionFilter(
		async (manager, ok) => {
			// if(newPath == '/pes'){
			// 	ok()
			// 	throw Error('powel nahoy')
			// }
			const res = await provider.list(newPath)
			if(res.status == 200){
				manager.folder.set(() => res.list);
				console.log(res.list)
				setPath(newPath)
				setStatus('')
				ok()
			}else{
				setStatus(JSON.stringify(res))
			}	
		}
	)

	useEffect(() => { setPathHook(path) }) // here can cause
	
	return { 
		...impl, 
		setPath: setPathHook
	} as typeof impl
}

export const useFileManager = () => useContext(FileManagerContext);


export function FileManager(props: IFileManagerProps) {
	const manager = useFileManagerCore({
		path: props.path ?? "/",
		provider: props.provider,
		mode: props.mode,
		triggers: props.triggers
	})

	const { ref, contextMenu } = manager

	function onClick(event: MouseEvent) {
		manager.closeModal();
		event.stopPropagation();
	}

	return (
		<>
			<FileManagerContext.Provider value={manager}>
				<div ref={ref} className={styles.wrapper} onClick={onClick}>
					{/* <p className={styles.title}>File manager</p> */}
					<header className={styles.header}>
						<Buttons className={styles.buttons}>
							<ParentFolderButton />
							<RefreshButton/>
						</Buttons>
						<FilePath />
					</header>
					<div className={styles.mainwrapper}>
						<main className={styles.main}>
							<DirectoryHierarchy path="/" />
							<ContentView/>
						</main>
					</div>
					<footer className={styles.footer}>
						<Uploader />
						<span>{manager.status}</span>
					</footer>
				</div>
				{contextMenu && <ModalMenu menu={contextMenu} />}
			</FileManagerContext.Provider>
		</>
	);
}

async function OnClickClipboard(event: MouseEvent, getDataCallback: () => string) {
	const path = getDataCallback();
	if (navigator.clipboard) {
		await navigator.clipboard.writeText(path);
	} else {
		alert(`clipboard_passed: ${path}`);
	}
	// event.stopPropagation()
}

export function ClipboardCopy({
	file,
	onCopy,
	children,
}: IFileProps & { 
	children?: ReactNode; 
	onCopy: () => string 
}) {
	if (file.type === 'dir') {
		return <>
			{/* not available for dir */}
		</>
	}

	return <ActionItem onClick={(event) => OnClickClipboard(event, onCopy)}>
		<div>
			{children}
		</div>
	</ActionItem>
}
