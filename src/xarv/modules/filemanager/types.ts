export type TFD = 'file' | 'dir'
export type TMime = string

export interface IFile{
	name: string
	path: string
	type: TFD
	size?: number
	mime_type?: TMime 
}