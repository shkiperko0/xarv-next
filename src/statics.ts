import { SharedStatics } from "shared/common/types/statics"

const GetEnv = <Type>(value: Type | undefined, callback: (value?: Type) => Type | undefined) => {
    return callback(value)
}

type EnvironmentType = typeof process.env.NODE_ENV

const environmentTypes: EnvironmentType[] = ['development', 'production', 'test']
const defaultEnvironmentType: EnvironmentType = 'development'

export const statics = {
    node_mode: GetEnv(process.env.NODE_ENV, (mode) => {
        if(mode === undefined){
            console.warn(`environment variable 'NODE_ENV' is not set, so '${defaultEnvironmentType}' used as default`)
            return defaultEnvironmentType
        }
        else if(environmentTypes.indexOf(mode) == -1){ 
            console.warn(`invalid environment type '${mode}', also '${defaultEnvironmentType}' used as default`)
            return defaultEnvironmentType
        }
        return mode
    }),

    mode: GetEnv(process.env.NEXT_PUBLIC_MODE as EnvironmentType, (mode) => {
        if(mode === undefined){
            console.warn(`environment variable 'NEXT_PUBLIC_MODE' is not set, so '${defaultEnvironmentType}' used as default`)
            return defaultEnvironmentType
        }
        else if(environmentTypes.indexOf(mode) == -1){ 
            console.warn(`invalid environment type '${mode}', also '${defaultEnvironmentType}' used as default`)
            return defaultEnvironmentType
        }
        return mode
    }),

    host: {
        gate: GetEnv(process.env.NEXT_PUBLIC_GATE_HOST, (host) => {
            if(host === undefined) console.error(`environment variable 'NEXT_PUBLIC_GATE_HOST' is not set, so api calls will not work`)
            return host
        }),
    }
}

export const shared_statics: SharedStatics = {
    AuthTokenNames: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken' 
    }
}