import React, { useState, useRef } from "react";
import Region from "./Region";

const SvgShapeSelector = ({
  children,
  boundary,
  categories,
  readOnly,
  regionDefs,
  states,
  onSwitchCategory
}) => {
  const offsetX = useRef();
  const offsetY = useRef();
  const [hoveringOver, setHoveringOver] = useState();
  const [colorForHoldAndDragPaint, setColorForHoldAndDragPaint] = useState();

  // Make sure the mouseovered item to be rendered on top
  const sortedHightlightedLast = regionDefs.sort(a =>
    a.kode === hoveringOver ? 1 : -1
  );
  const svgRegions = sortedHightlightedLast.map(regionDef => {
    const kode = regionDef.kode;
    const state = states[kode] || 0;
    const mainStyle = categories[state];
    let style = mainStyle.normal;
    if (hoveringOver === kode) style = mainStyle.highlight;
    return (
      <Region
        key={kode}
        kode={kode}
        title={regionDef.title}
        boundaryPath={boundary.regions[kode]}
        style={style}
        readonly={readOnly}
        onMouseOver={e => {
          e.stopPropagation();
          offsetX.current.beginElement(); //triggers animation
          offsetY.current.beginElement(); //triggers animation

          if (readOnly) return;
          setHoveringOver(kode);
          if (colorForHoldAndDragPaint !== null)
            onSwitchCategory &&
              onSwitchCategory(e, kode, colorForHoldAndDragPaint);
        }}
        onMouseDown={e => {
          e.stopPropagation();
          if (readOnly) return;
          let offset = 0;
          if (state == 1) offset = 1;
          else if (state === 2) offset = -3;
          else if (state == 3) offset = -2;
          const newState = (state + 1 + offset) % categories.length;
          onSwitchCategory && onSwitchCategory(e, kode, newState);
          setColorForHoldAndDragPaint(newState);
        }}
        onMouseLeave={e => {
          setHoveringOver(null);
        }}
      />
    );
  });

  return (
    <svg
      style={{
        userSelect: "none",
        left: 0,
        top: 0,
        width: "100%",
        height: "auto"
      }}
      preserveAspectRatio="none"
      viewBox={boundary.viewbox}
      onMouseLeave={e => {
        e.stopPropagation();
        setHoveringOver(null);
        setColorForHoldAndDragPaint(null);
      }}
      onMouseUp={e => {
        e.stopPropagation();
        if (readOnly) return;
        setColorForHoldAndDragPaint(null);
      }}
      onMouseEnter={e => {
        e.stopPropagation();
        setColorForHoldAndDragPaint(null);
      }}
      onMouseMove={e => {
        e.stopPropagation();
      }}
    >
      <defs>
        <filter id="f1" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset result="offOut" in="SourceAlpha" dx="4" dy="4"></feOffset>
          <feGaussianBlur
            result="blurOut"
            in="offOut"
            stdDeviation="4"
          ></feGaussianBlur>
          <feColorMatrix
            result="matrixOut"
            in="blurOut"
            type="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0"
          />
          <feBlend in="SourceGraphic" in2="matrixOut" mode="normal" />
        </filter>
        <filter id="f2" x="-50%" y="-50%" width="200%" height="200%">
          <feOffset result="offOut" in="SourceAlpha" dx="8" dy="8">
            <animate
              ref={offsetX}
              attributeName="dx"
              calcMode="linear"
              values="0;8"
              dur="0.3s"
            />
            <animate
              ref={offsetY}
              attributeName="dy"
              calcMode="linear"
              begin="0s"
              dur="0.3s"
              values="0;8"
            />
          </feOffset>
          <feGaussianBlur result="blurOut" in="offOut" stdDeviation="4">
            <animate
              ref={offsetY}
              attributeName="stdDeviation"
              calcMode="linear"
              begin="0s"
              dur="0.3s"
              values="0;8"
            />
          </feGaussianBlur>
          <feColorMatrix
            result="matrixOut"
            in="blurOut"
            type="matrix"
            values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0"
          />
          <feBlend in="SourceGraphic" in2="matrixOut" mode="normal" />
        </filter>
      </defs>
      <g style={{ filter: "url(#f1)" }}>{svgRegions}</g>
      {children}
    </svg>
  );
};

export default SvgShapeSelector;
