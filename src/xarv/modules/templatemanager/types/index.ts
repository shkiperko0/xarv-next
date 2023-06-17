import { TempalteType } from ".."

export enum EPostStatuses {
    'publish',
    'future',
    'draft',
    'pending',
    'trash',
}

export enum EPostType {
    'post',
    'page'
}

export type TPostType = keyof typeof EPostType
export type TPostStatuses = keyof typeof EPostStatuses

export interface IPostData<MetaType extends {} = any> {
    id: number,
    user_id: number,
    caption: string,
    category_id: number | null,
    created_at: string,
    publish_at: string,
    text: string,
    image_url: string,
    template: TempalteType,

    meta: MetaType,

    type: TPostType,
    status: TPostStatuses,
}

export interface IPostProps<MetaType extends {} = any> {
    post: IPostData<MetaType>
}

export type TPostRenderFunction<MetaType extends {}> = (props: IPostProps<MetaType>) => JSX.Element 
