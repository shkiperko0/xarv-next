import { ReactNode } from "react";
import styles from "./styles.module.scss";
import { cl } from "src/xarv/plain/utils";

interface IButtonsProps {
  className?: string;
  children?: ReactNode;
}

export default function Buttons({ children, className }: IButtonsProps) {
  return <button className={cl(styles.buttons, className)}>{children}</button>;
}
