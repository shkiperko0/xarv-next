import { IPoint } from "src/xarv/plain/types";

export interface IOffset{
    offsetX: number
    offsetY: number
}

export interface IPos{
    posX: number
    posY: number
}

export interface ISize2D{
    height: number,
    width: number
}

export interface CScriptDisplay extends IOffset {
    scale: number
}
  
export interface CScriptNodeDisplay extends IPos{

}
  
export const defaultScriptFrameSize: ISize2D = {
    height: 10000,
    width: 10000
}

export const defaultScriptFrameCenter: IOffset = {
    offsetX: defaultScriptFrameSize.width / 2,
    offsetY: defaultScriptFrameSize.height / 2
}

export const pointAddOffset = (p: IPoint, o: IOffset): IPoint => ({
    x: p.x + o.offsetX,
    y: p.y + o.offsetY
})

export const posAddOffset = (p: IPos, o: IOffset): IPoint => ({
    x: p.posX + o.offsetX,
    y: p.posY + o.offsetY
})

export const offsetAddOffset = (p: IOffset, o: IOffset): IPoint => ({
    x: p.offsetX + o.offsetX,
    y: p.offsetY + o.offsetY
})

export const pointSubOffset = (p: IPoint, o: IOffset): IPoint => ({
    x: p.x - o.offsetX,
    y: p.y - o.offsetY
})

export const posSubOffset = (p: IPos, o: IOffset): IPoint => ({
    x: p.posX - o.offsetX,
    y: p.posY - o.offsetY
})

export const offsetSubOffset = (p: IOffset, o: IOffset): IPoint => ({
    x: p.offsetX - o.offsetX,
    y: p.offsetY - o.offsetY
})

export const pos2point = (a: IPos): IPoint => ({
    x: a.posX,
    y: a.posY
})

export const point2pos = (a: IPoint): IPos => ({
    posX: a.x,
    posY: a.y
})

export const posOffsetFrame = (pos: IPoint): IPoint => ({
    x: pos.x + defaultScriptFrameCenter.offsetX,
    y: pos.y + defaultScriptFrameCenter.offsetY 
})

export const posOffsetFrameBack = (pos: IPoint): IPoint => ({
    x: pos.x - defaultScriptFrameCenter.offsetX,
    y: pos.y - defaultScriptFrameCenter.offsetY 
})

export const defaultScriptDisplaySettings: CScriptDisplay = { 
    offsetX: -defaultScriptFrameCenter.offsetX, 
    offsetY: -defaultScriptFrameCenter.offsetY, 
    scale: 1.0 
}

export const defaultScriptNodeDisplaySettings: CScriptNodeDisplay = { 
    posX: 0, 
    posY: 0 
}
  