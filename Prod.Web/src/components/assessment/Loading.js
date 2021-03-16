import React from 'react'

export default function Loading() {
    const style = {
        zIndex: 10000,
        position: 'relative',
        left: "20px"
    }
    return (
        <div style={style}>
            <div className={"three-bounce"}>
                <div className="bounce1"/>
                <div className="bounce2"/>
                <div className="bounce3"/>
            </div>
        </div>
    )
}
