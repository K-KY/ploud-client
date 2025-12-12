import React from 'react';
import {LinearLayout} from './LinearLayout';

interface BorderLayoutProps {
    children: React.ReactNode;
    padding?: string;
    border?: string;
    borderRadius?: string;
    background?: string;
    shadow?: boolean;
    direction?: 'horizontal' | 'vertical';
    gap?: string;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    cursor?: string;
}

const BorderLayout: React.FC<BorderLayoutProps> = ({
                                                       children,
                                                       padding = '1rem',
                                                       border = '1px solid #e5e7eb',
                                                       borderRadius = '0.5rem',
                                                       background = '#ffffff',
                                                       shadow = false,
                                                       direction = 'horizontal',
                                                       gap = '0.75rem',
                                                       align = 'center',
                                                       justify = 'start',
                                                       className = '',
                                                       style = {},
                                                       onClick,
                                                       cursor
                                                   }) => {
    const containerStyle: React.CSSProperties = {
        padding,
        border,
        borderRadius,
        background,
        boxShadow: shadow ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.0)',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        cursor: cursor,

        ...style
    };

    return (
        <div
            className={`${className}`}
            style={containerStyle}
            onClick={onClick}
        >
            <LinearLayout
                direction={direction}
                gap={gap}
                align={align}
                justify={justify}
            >
                {children}
            </LinearLayout>
        </div>
    );
};

export {BorderLayout};