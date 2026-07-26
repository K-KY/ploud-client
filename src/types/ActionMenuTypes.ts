import type {ReactNode} from "react";

interface ActionMenuItem {
    key: string;
    label: string;
    icon?: ReactNode;
    danger?: boolean;
    onClick: () => void;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
}

export type {ActionMenuItem, ActionMenuProps};
