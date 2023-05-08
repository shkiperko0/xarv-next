


export type callback<Type> = () => Type

export function cl(...cls: (string | null | undefined | [ string, boolean | null | undefined | callback<boolean | null | undefined> ])[]){
    return cls.map(cl => {
        if(!cl){
            return null
        }
        if(typeof cl == 'object'){
          if(typeof cl[1] == 'function'){
            return cl[1]() ? cl[0] : null
          }
          return cl[1] ? cl[0] : null
        }
        if(typeof cl == 'string'){
          return cl
        }
        return null
    }).join(' ')
}


export const toBase64 = (data: string, enc: BufferEncoding = 'utf-8') => Buffer.from(data, enc).toString('base64')
export const fromBase64 = (data: string, enc: BufferEncoding = 'utf-8') => Buffer.from(data, 'base64').toString(enc)

export const AnyJSON_toBase64 = (data: any) => toBase64(JSON.stringify(data))
export const AnyJSON_fromBase64 = (data: string) => { try{ return JSON.parse(fromBase64(data)) } catch(error) { return undefined } }

export function findByKey<T extends {}>(list: T[], key: keyof T, value: T[keyof T]){
    return list.find(item => (item[key] === value))
}

export function keyByValue<T extends {}, K extends keyof T = keyof T>(dict: T, value: T[keyof T]) {
    const res = Object.entries(dict).find(([_,fieldValue]) => fieldValue == value) as ([K, any] | undefined)
    return res === undefined ? res : res[0]
}

export function getDocument(){
    return (typeof document == 'undefined') ? null : document
}

export function getWindow(){
    return (typeof window == 'undefined') ? null : window
}

export function getCookie(name: string): string | null {
    const document = getDocument()
    if(document){
        const { cookie } = document
        const rows = cookie.split('; ')
        const row = rows.find((row) => row.startsWith(`${name}=`))
        if(row){
            const [_, value] = row.split('='); 
            return value
        }
    }
    return null
}

export function GetTokenPayload<TokenType extends {}>(token: string): TokenType | undefined {
    try {
        const [ header, body, signature ] = token.split('.');
        const json = Buffer.from(body, 'base64').toString('utf-8')
        return JSON.parse(json)
    } catch (error) {
        return undefined
    }
}

export function setCookie(name: string, value: string, date: Date, path: string | null ='/'){
    const expires = date.toUTCString()
    // Thu, 18 Dec 2013 12:00:00 UTC
    console.log({ cookie: { name, value, expires } })
    document.cookie = `${name}=${value}; expires=${expires}; ${path ? `path=${path};` : null}SameSite=Strict`
}

export const clearCookie = (name: string) => setCookie(name, '', new Date(1))