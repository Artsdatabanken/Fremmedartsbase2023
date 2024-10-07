import React from "react";

const Loading = ({ style }) => {
    const bouncerStyle = {
        left: 20,
        top: 20
    };
    return (
        <div
            style={{
                position: "absolute",
                zIndex: 10000,
                top: "50%",
                left: "50%",
                width: "80%",
                ...style
            }}
        >
            <div style={bouncerStyle}>
                <div className={"three-bounce"}>
                    <div className="bounce1" />
                    <div className="bounce2" />
                    <div className="bounce3" />
                </div>
            </div>
        </div>
    );
}

export default Loading
