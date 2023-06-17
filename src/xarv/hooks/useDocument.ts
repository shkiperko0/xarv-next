import { useEffect, useState } from "react";
import { getDocument } from "../plain/utils";

export function useDocument<DocumentType extends Document = Document>() {
    const data = getDocument() as DocumentType;
    const [state, setState] = useState<DocumentType | null>(null);
    useEffect(() => setState(data), [data]);
    return state;
}
