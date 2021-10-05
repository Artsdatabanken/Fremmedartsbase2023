import React from "react";

const Region = ({
  kode,
  title,
  boundaryPath,
  style,
  readonly,
  onMouseDown,
  onMouseOver,
  onMouseLeave
}) => {
  return (
    <g
      key={kode}
      {...style}
      style={{ cursor: readonly ? "arrow" : "hand" }}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      {boundaryPath}
      <title>{title}</title>
    </g>
  );
};

export default Region;
