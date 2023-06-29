
export type EnvironmentType = typeof process.env.NODE_ENV
export const defaultEnvironmentType: EnvironmentType = 'development' 
export const environmentTypes: EnvironmentType[] = ["production", "development", "test"] 
