import React from "react";

const Region = ({
  kode,
  title,
  stateIndex,
  boundaryPath,
  style,
  readonly,
  onMouseDown,
  onMouseOver,
  onMouseLeave,
  disabled
}) => {
  return (
    <g
      key={kode}
      kode={kode}
      disabled={disabled}
      {...style}
      stateIndex={stateIndex}
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
