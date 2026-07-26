import type {CSSProperties, ReactNode} from "react";

type LayoutDirection = "horizontal" | "vertical";
type LayoutAlign = "start" | "center" | "end" | "stretch";
type LayoutJustify = "start" | "center" | "end" | "between" | "around";

interface LinearLayoutProps {
    children: ReactNode;
    direction?: LayoutDirection;
    gap?: string;
    align?: LayoutAlign;
    justify?: LayoutJustify;
    className?: string;
    style?: CSSProperties;
}

interface BorderLayoutProps extends LinearLayoutProps {
    padding?: string;
    border?: string;
    borderRadius?: string;
    background?: string;
    shadow?: boolean;
    onClick?: () => void;
    cursor?: string;
}

export type {BorderLayoutProps, LayoutAlign, LayoutDirection, LayoutJustify, LinearLayoutProps};
