import { IPostData, IPostProps } from "../post";

export interface IArticleMeta{

}

const text = `
<p>There\`s all kinds of great products to choose from this month. Click now 
to see some of our personal favorites and explore the sale today. </p>
<h2>Paragrapth title 2</h2>
<p>This sale has systems, props, characters, environments, effects, sounds, music, 
Blueprints, and more, so start exploring today. You might discover the perfect 
fit for your next project.<h2>Paragrapth title 3</h2><p>This sale has systems, props, 
characters, environments, effects, sounds, music, Blueprints, and more, so start exploring 
today. You might discover the perfect fit for your next project.<p>This sale has systems, 
props, characters, environments, effects, sounds, music, Blueprints, and more, so start 
exploring today. You might discover the perfect fit for your next project.<p>This sale 
has systems, props, characters, environments, effects, sounds, music, Blueprints, and more, 
so start exploring today. You might discover the perfect fit for your next project.
`

export const mock_article_post: IPostData<IArticleMeta>  = {
    id: 0,
    caption: "Article caption",
    category_id: 0,
    created_at: '2022-09-26T04:53:17.188Z',
    publish_at: '2022-09-26T04:53:17.188Z',
    text,
    image_url: "",
    template: 'article',
    meta: {},
    type: 'post',
    status: 'publish',
    user_id: 0,
}

export const Template_Article = (props: IPostProps<IArticleMeta>) => {
    const { 
        post: { caption, text: __html, meta }
    } = props

    return <>
        <div>
            <div><span>{caption}</span></div>
            <div dangerouslySetInnerHTML={{__html}}/>
            <div>{JSON.stringify(meta)}</div>
        </div>
    </>
}

export const Template_Article_Mock = () => <Template_Article post={mock_article_post}/>
