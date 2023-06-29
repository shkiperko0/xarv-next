import { Header_Auth, Header_Auth_JSON } from "src/xarv/plain/utils";
import { IFile } from "./types";

export const getRelativeFullPath = ({ path, name }: Pick<IFile, 'name' | 'path'>) => {
	return path == "/" ? path + name : path + "/" + name;
}

export class CFileManagerProvider {

    baseUrl: string

    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }

    link(file: IFile){
        return `${this.baseUrl}/api/v1/filemanager/get` + getRelativeFullPath(file)
    }

    async list(path: string):  Promise<{ status: 200, list: IFile[] } | { status: 500, message: string } > {
        const res = await fetch(`${this.baseUrl}/api/v1/filemanager/list`, {
            method: 'POST',
            headers: Header_Auth_JSON(),
            body: JSON.stringify({path})
        });

        const { status } = res
        if(status == 200){
            const { list } = await res.json() as { list: IFile[] }
            return { 
                status,
                list: list.map(({mime_type, ...file}) => {
                    if(mime_type){
                        const [a, b] = mime_type.split(';')[0].split('/')
                        mime_type = [a, b].join('/')
                    }
                    return { ...file, mime_type }
                })
            }
        }

        return { status, ...await res.json() }
    }

    // return success 
    async mkdir(path: string) {
        return await fetch(`${this.baseUrl}/api/v1/filemanager/mkdir`, {
            method: 'POST',
            headers: Header_Auth_JSON(),
            body: JSON.stringify({path})
        });
    } 

    // return success
    async delete(file: IFile, recursive: boolean = false) {
        console.log('trying delete file')
        return await fetch(`${this.baseUrl}/api/v1/filemanager/delete`, {
            method: "POST",
            headers: Header_Auth_JSON(),
            body: JSON.stringify({
                path: getRelativeFullPath(file),
                recursive
            })
        })
    }

    // return success
    async rename(file: IFile, newName: string) {
        console.log('trying rename file')
        return await fetch(`${this.baseUrl}/api/v1/filemanager/renmove`, {
            method: "POST",
            headers: Header_Auth_JSON(),
            body: JSON.stringify({
                path: getRelativeFullPath(file),
                new_path: getRelativeFullPath({name: newName, path: file.path})
            })
        })
    }

    // return success
    async move(file: IFile, newPath: string) {
        console.log('trying move file')
        return await fetch(`${this.baseUrl}/api/v1/filemanager/renmove`, {
            method: "POST",
            headers: Header_Auth_JSON(),
            body: JSON.stringify({
                path: getRelativeFullPath(file),
                new_path: getRelativeFullPath({name: file.name, path: newPath})
            })
        })
    }

    // return { list: [uploaded files], conflicts???: [conflict names] }
    async upload(path: string, files: File[], name: string = "files"){
        const data = new FormData();
        data.append('path', path)
        const a_files = Array.from(files);
        a_files.forEach(file => data.append(name, file));

        return await fetch(`${this.baseUrl}/api/v1/filemanager/upload`, {
            method: "POST",
            headers: Header_Auth(),
            body: data,
        });
    }

}
