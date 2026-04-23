import React, {useState, useRef, useEffect} from 'react';
import dotIcon from "../assets/dotIcon.svg"
import styles from "../styles/ActionMenu.module.css"

export interface ActionMenuItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    danger?: boolean;
    onClick: () => void;
}

interface ActionMenuProps {
    items: ActionMenuItem[];
}

const ActionMenu: React.FC<ActionMenuProps> = ({items}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div
            ref={ref}
            className={styles.menuWrapper}
            onClick={e => e.stopPropagation()}
        >
            <button
                className={styles.actionButton}
                onClick={() => setOpen(prev => !prev)}
            >
                <img src={dotIcon} alt="메뉴 열기" />
            </button>

            {open && (
                <div className={styles.dropdown}>
                    {items.map((item, idx) => (
                        <React.Fragment key={item.key}>
                            {item.danger && idx > 0 && (
                                <div className={styles.divider}/>
                            )}
                            <button
                                className={`${styles.menuItem} ${item.danger ? styles.menuItemDanger : ''}`}
                                onClick={() => {
                                    item.onClick();
                                    setOpen(false);
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}
        </div>
    );
};

export {ActionMenu};
