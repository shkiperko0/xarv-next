import { useEffect, useState } from "react";
import { getWindow } from "../plain/utils";

export function useWindow<WindowType extends Window = Window>() {
    const data = getWindow() as any as WindowType;
    const [state, setState] = useState<WindowType | null>(null);
    useEffect(() => setState(data), [data]);
    return state;
}
