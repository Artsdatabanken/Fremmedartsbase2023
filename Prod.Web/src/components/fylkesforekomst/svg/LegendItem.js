import React from "react";

const LegendItem = ({ title, tooltip, showRect, fill, x, y, width, height, size, filter }) => (
  <svg x={x} y={y} width={width} height={height} showRect={showRect}>
    {showRect &&
    <rect
      width={size}
      height={size}
      style={{
        fill: fill,
        stroke: "rgb(0,0,0)",
        strokeWidth: 1,
        filter: filter ? "url(#f1)" : ""
      }}
    ></rect>
    }
    <text fontSize={size} x={1.5 * size} y={size*0.85}>
      {title}
    </text>
    <title>{tooltip}</title>
  </svg>
);

export default LegendItem;
