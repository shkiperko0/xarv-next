import { DependencyList, useEffect } from "react"

export const useAsyncEffect = (callback: () => Promise<any>, dep: DependencyList = []) => 
  useEffect(() => {
    callback()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dep)