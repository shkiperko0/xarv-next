import { useState, useEffect } from 'react'

type HaveDefault = { default: any }
type ModuleFunction<ModuleType> = (module: ModuleType) => any

export function useImport<ModuleType extends HaveDefault>(__import: Promise<ModuleType>) { 
    return useImportEx(__import, m => m)
  }
  
  export function useImportDefault<ModuleType extends HaveDefault>(__import: Promise<ModuleType>) { 
    return useImportEx(__import, m => m.default)
  }
  
  export function useImportEx<ModuleType extends HaveDefault, ModFunc extends ModuleFunction<ModuleType>, ModResult = ReturnType<ModFunc>>(__import: Promise<ModuleType>, mod: ModFunc): ModResult | null { 
    const [ moddedModule, setModdedModule ] = useState<ModResult | null>(null)
    useEffect(() => { __import.then(module => {
      setModdedModule(() => mod(module))
    }) }, [__import, mod])
    return moddedModule
  }