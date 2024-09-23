import React from "react";

const Pattern = ({
  patternProps = {
    id: "diagonalHatch",
    viewBox: "0,0,40,40",
    width: 15,
    height: 15,
    patternUnits: "userSpaceOnUse",
    patternTransform: "rotate(90) scale(1.3 1.3)"
  },
  width = 40,
  height = 40,
  backgroundStyle = { fill: "HSL(26.7, 15%, 76.5%)" },
  pathStyle = { stroke: "#ddd", strokeWidth: 15 },
  path = "M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20"
}) => (
  <pattern {...patternProps}>
    <rect width={width} height={height} style={backgroundStyle} />
    <path d={path} style={pathStyle} />
  </pattern>
);

export default Pattern;
