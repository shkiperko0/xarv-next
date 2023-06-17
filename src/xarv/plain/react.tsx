import { Attributes, ForwardRefExoticComponent, PropsWithoutRef, ReactElement, ReactNode, RefObject, forwardRef } from "react";

export interface ChildrenProp{
    children?: ReactNode
}

interface RefObjectAttributes<T> extends Attributes {
	ref?: RefObject<T>;
}

interface ForwardRefObjectRenderFunction<T, P = {}> {
	(props: P, ref: RefObject<T>): ReactElement | null;
	displayName?: string;
	defaultProps?: never;
	propTypes?: never;
}

export function forwardRefObject<T, P = {}>(render: ForwardRefObjectRenderFunction<T, P>): ForwardRefExoticComponent<PropsWithoutRef<P> & RefObjectAttributes<T>> {
	return forwardRef(render as any) as any
}