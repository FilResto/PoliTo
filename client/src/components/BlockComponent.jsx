import React from "react";

const centerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
};
function HeaderBlock(props) {
    return (
        <div style={centerStyle}>
            <h2 className="display-1 text-capitalize py-5 fs-1" style={{ color: 'green',fontWeight: 'normal', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}>
                {props.content}
            </h2>
        </div>
    );
}

function ParagraphBlock(props) {
    const style = {
        color: 'black',
        fontSize: '1rem',
        textAlign: 'justify',
        lineHeight: '1.6'
    };
    return (
        <div style={centerStyle}>
            <p style={style}>
                {props.content}
            </p>
        </div>
    );
}

function ImageBlock(props) {
    const style = {
        maxWidth: '30%',
        height: 'auto'
    };
    return (
        <div style={centerStyle}>
            <img 
                src={props.content} 
                alt="new" 
                style={style}
            />
        </div>
    );
}

export { ImageBlock, HeaderBlock, ParagraphBlock };