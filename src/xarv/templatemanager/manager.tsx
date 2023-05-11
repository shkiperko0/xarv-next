import { IPostProps, TPostRenderFunction } from './post'
import { Template_Article } from './templates/article'

const templateListRegister = {
    article: Template_Article,
    dummy: () => <></>,
} 

export type TTempalteListType = { [name: string]: TPostRenderFunction<any> }
export type TempalteListType = typeof templateListRegister
export type TempalteType = keyof TempalteListType
export const templateList = templateListRegister satisfies TTempalteListType

export const GetListTemplates = () => 
    Object.keys(templateList).map((name, index) => ({ id: index, name }))

export const GetTemplateComponent = <T extends TempalteType>(template: T) => {
    return templateList[template] as TempalteListType[T]
}

export const GetTemplateComponent_Safe = (template: string): TPostRenderFunction<any> => {
    const Component = GetTemplateComponent(template as TempalteType)
    return Component ?? (() => <>No Render</>)
}

export const TemplateManager = (props: Partial<IPostProps> ) => {
    const { post: data } = props
    if (data) {
        const Component = GetTemplateComponent_Safe(data.template)
        return <Component post={data} />
    }
    return <>Template manager: No data</>
}
