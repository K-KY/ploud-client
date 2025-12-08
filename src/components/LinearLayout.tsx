import React from 'react';

interface LinearLayoutProps {
    children: React.ReactNode;
    direction?: 'horizontal' | 'vertical';
    gap?: string;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around';
    className?: string;
    style?: React.CSSProperties;
}

//기본값 지정
const LinearLayout: React.FC<LinearLayoutProps> = ({
                                                       children,
                                                       direction = 'horizontal',
                                                       gap = '0.5rem',
                                                       align = 'stretch',
                                                       justify = 'start',
                                                       className = '',
                                                       style = {}
                                                   }) => {
    const alignMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch'
    };

    const justifyMap = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        between: 'space-between',
        around: 'space-around'
    };

    const layoutStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        gap: gap,
        alignItems: alignMap[align],
        justifyContent: justifyMap[justify],
        ...style
    };

    return (
        <div className={`${className}`} style={layoutStyle}>
            {children}
        </div>
    );
};

export { LinearLayout };