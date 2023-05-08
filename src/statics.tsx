
export enum EEnvironmentType{
    development,
    production 
}

export type EnvironmentType = keyof typeof EEnvironmentType
export const defaultEnvironmentType: EnvironmentType = 'development' 

export const GetEnvironmentType = (): EnvironmentType => {
    const mode = process.env.NEXT_PUBLIC_ENV_APP_TYPE as EnvironmentType
    if(mode === undefined){
        console.warn(`env 'NEXT_PUBLIC_ENV_APP_TYPE' is not set, so '${defaultEnvironmentType}' used as default`)
        return defaultEnvironmentType
    }
    else if(Object.keys(EEnvironmentType).indexOf(mode) == -1){ 
        console.warn(`invalid enviroment type '${mode}', also '${defaultEnvironmentType}' used as default`)
        return defaultEnvironmentType
    }
    return mode
}

export const statics = {
    mode: GetEnvironmentType(),

    host: {
        api: process.env.NEXT_PUBLIC_ENV_API_HOST ?? console.warn(`env 'NEXT_PUBLIC_ENV_API_HOST' is not set, so api calls don\`t work`)
    }

}

export default statics