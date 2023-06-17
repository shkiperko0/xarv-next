import { IPoint, IRect } from "../types";

export function getCookie(name: string): string | null {
    const { cookie } = document;
    const rows = cookie.split("; ");
    const row = rows.find((row) => row.startsWith(`${name}=`));
    if (row) {
        const [_, value] = row?.split("=");
        return value;
    }
    return null;
}

export const structuredClone = <T = any>(value: T): T => {
    return structuredClone_JSON(value)
}

export const structuredClone_JSON = <T = any>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T
}

export const toBase64 = (data: string, enc: BufferEncoding = "utf-8") => Buffer.from(data, enc).toString("base64");
export const fromBase64 = (data: string, enc: BufferEncoding = "utf-8") => Buffer.from(data, "base64").toString(enc);

export const AnyJSON_toBase64 = (data: any) => toBase64(JSON.stringify(data));
export const AnyJSON_fromBase64 = (data: string) => {
    try {
        return JSON.parse(fromBase64(data));
    } catch (error) {
        return undefined;
    }
};

export function parseToken<Type = any>(token: string): Type {
    const [header, body, signature] = token.split(".");
    const json = fromBase64(body, "utf-8");
    return JSON.parse(json);
}

export function setCookie(name: string, value: string, date: Date, path: string | null = "/") {
    const expires = date.toUTCString();
    // Thu, 18 Dec 2013 12:00:00 UTC
    document.cookie = `${name}=${value}; expires=${expires}; ${path ? `path=${path};` : null}SameSite=Strict`;
}

export const clearCookie = (name: string) => setCookie(name, "", new Date(1));

export const getRefreshToken = () => getCookie("refreshToken");
export const getAccessToken = () => getCookie("accessToken");

export const clearAuthCookies = () => ["refreshToken", "accessToken"].forEach((name) => clearCookie(name));

export const Header_Auth = () => ({
    Authorization: `Bearer ${getRefreshToken()}`,
});

export const Header_Auth_JSON = () => ({
    Authorization: `Bearer ${getRefreshToken()}`,
    "Content-Type": "application/json",
});

export function findByKey<T>(array_of: T[], key: keyof T, value: any) {
    return array_of.find((item: T) => item[key] === value);
}

export function keyByValue(object: object, value: any) {
    return Object.entries(object).find((entry) => entry[1] == value)?.[0];
}

export async function uploadForm(form: HTMLFormElement) {
    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form),
        });
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error);
    }
    return {};
}

export type callback<Type> = () => Type;
type cssfunc = () => string | null | undefined;
type ICSSStyle = string | null | undefined | cssfunc;
type ICSSStyleCondition = boolean | null | undefined;
type ICSSStyleArg = ICSSStyle | callback<ICSSStyle> | [ICSSStyle, ICSSStyleCondition];

export function cl(...styles: ICSSStyleArg[]) {
    return styles.map((c) => {
        if (c) {
            if (typeof c == "string") return c;
            if (typeof c == "object") return c[1] ? c[0] ?? null : null;
            if (typeof c == "function") return c() ?? null;
        }
        return null;
    }).join(" ");
}

export function boolToString(bool: any): string {
    switch (typeof bool) {
        case "boolean":
            return bool ? "true" : "false";
        case "number":
            return bool > 0 ? "true" : "false";
        case "string":
            return parseBool(bool) ? "true" : "false";
    }
    return "false";
}

export const _str_boolean_true = ["true", "y", "yes", "+", "on", "enabled"];
export const _str_boolean_false = ["false", "n", "no", "-", "off", "disabled"];

export function parseBool(str: string): boolean {
    return _str_boolean_true.indexOf(str.toLowerCase()) != -1;
}

export function formatBool(data: boolean, index = 0): string {
    const _str_boolean = data ? _str_boolean_true : _str_boolean_false;
    return _str_boolean.length < index ? _str_boolean[index] : _str_boolean[0];
}

const TypeToTextObj = {
    boolean: (data: boolean) => (data ? "true" : "false"),
    number: (data: number) => data.toString(10),
    string: (data: string) => data,
    object: (data: object) => JSON.stringify(data),
} as const;

type TypeToTextMap = typeof TypeToTextObj
type TypeToTextMapKey = keyof TypeToTextMap

export function Type2Text<K extends TypeToTextMapKey>(data: Parameters<TypeToTextMap[K]>[0], type: K): string {
    if (data === undefined || data === null) return "";

    const parser = TypeToTextObj[type];
    return parser ? parser(data as never) : "";
}

const TextToTypeObj = {
    boolean: (text: string) => parseBool(text),
    number: (text: string) => parseInt(text, 10),
    string: (text: string) => text,
    object: (text: string) => {
        try {
            return JSON.parse(text);
        } catch (error) {
            return undefined;
        }
    },
} as const;

type TextToTypeMap = typeof TextToTypeObj
type TextToTypeMapKey = keyof TextToTypeMap

export function Text2Type<K extends TextToTypeMapKey>(text: string, type: K): ReturnType<TextToTypeMap[K]> {
    const format = TextToTypeObj[type];
    if(format === undefined) throw Error(`no formater for type ${type}`)
    return format(text)
}

export function Object_OmitKeys<Type extends Object>(obj: Type, keys: (keyof Type | any)[]) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.indexOf(key as keyof Type) == -1));
}

export function Object_OnlyKeys<Type extends Object>(obj: Type, keys: (keyof Type | any)[]) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => keys.indexOf(key as keyof Type) != -1));
}


export type CanBeHolderObject = Array<never> | Object;
export type HolderObject = any
export type HolderObjectKey = string | number
export type HolverValueUnfolder = (holder: HolderObject, ki: HolderObjectKey) => any;

export function cbByPath(root: HolderObject, path: string, cb: HolverValueUnfolder) {
    let holder = root;

    const parts = path.split("/");
    if (parts.length) {
        let current = root;
        let lpart: any;

        for (const part of parts) {
            holder = current;
            if (typeof current !== "object" || current === null) return;

            current = current[part];
            lpart = part;
        }

        return cb(holder, lpart);
    }

    return;
}



export function ObjectRenameField(holder: HolderObject, oldname: string, newname: string) {
    holder[newname] = holder[oldname];
    delete holder[oldname];
    return;
}

export function GetHolderValueByPath(root: HolderObject, path: string) {
    return cbByPath(root, path, (holder, ki) => holder[ki]);
}

export function SetHolderValueByPath(root: HolderObject, path: string, value: any) {
    cbByPath(root, path, (holder, ki) => {
        holder[ki] = value;
    });
    return;
}

export function DeleteHolderValueByPath(root: HolderObject, path: string) {
    cbByPath(root, path, (holder, ki) => {
        if (holder instanceof Array) {
            const index = typeof ki == "string" ? parseInt(ki, 10) : ki;
            holder.slice(index, 1);
            return;
        }
        // else object
        delete holder[ki];
    });
    return;
}

export interface WindowWithUserData<Type = any> extends Window {
    __USER_DATA: Type;
    setUserData(data: Type): void;
}

export interface IUserWindowOptions {
    target?: string;
    features?: string;
}

export function getDocument() {
    return typeof document == "undefined" ? null : document;
}

export function getWindow() {
    return typeof window == "undefined" ? null : window;
}

export function openUserWindow<Type = any>(url: string | URL, data: Type, options: IUserWindowOptions = {}) {
    const window = getWindow()
    if (window === null) return null;
    const handle = window.open(url, options.target, options.features);
    if (handle === null) return null;
    const userWindow = handle as any as WindowWithUserData<Type>;
    userWindow.__USER_DATA = data;
    return userWindow;
}

export function getUserWindow<Type = any>() {    
    const window = getWindow()
    if (window === null) return null;
    const userWindow = window as any as WindowWithUserData<Type>;
    if (userWindow.__USER_DATA == undefined) return null;
    return userWindow;
}

export function MakePointInRect(point: IPoint, rect: IRect){
    return { 
        x: ((point.x < rect.left) ? rect.left : (point.x > rect.right ) ? rect.right : point.x),
        y: ((point.y < rect.top) ? rect.top : (point.y > rect.bottom) ? rect.bottom : point.y),
    }
}