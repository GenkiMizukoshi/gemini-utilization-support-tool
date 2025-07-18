
import React from 'react';

interface LoaderProps {
    size?: string;
    className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = '24px', className='' }) => {
    const style = {
        width: size,
        height: size,
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    };

    return (
        <>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
            <div style={style} className={className}></div>
        </>
    );
};

export default Loader;
