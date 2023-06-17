import { useEffect, useState } from "react";
import { WindowWithUserData, getUserWindow } from "../plain/utils";

export function useUserWindow<Type>() {
    const data = getUserWindow<Type>();
    const [state, setState] = useState<WindowWithUserData<Type> | null>(null);
    useEffect(() => setState(data), [data]);
    return state;
}