import React, { useState, useRef } from "react";
import Region from "./Region";

const SvgShapeSelector = ({
  children,
  boundary,
  categories,
  readOnly,
  regionDefs,
  states,
  stateIndex,
  onSwitchCategory,
  onSwitchOtherCategory
}) => {
  const offsetX = useRef();
  const offsetY = useRef();
  const [cursor, setCursor] = useState();
  const [hoveringOver, setHoveringOver] = useState();
  const [colorForHoldAndDragPaint, setColorForHoldAndDragPaint] = useState();

  // Make sure the mouseovered item to be rendered on top
  const sortedHightlightedLast = regionDefs.sort(a =>
    a.kode === hoveringOver ? 1 : -1
  );
  const svgRegions = sortedHightlightedLast.map(regionDef => {
    const kode = regionDef.kode;
    // const state = states[kode] || 0;
    const state = states[kode][`state${stateIndex}`] ? stateIndex : 2;
    const mainStyle = categories[state];
    let style = mainStyle.normal;
    if (hoveringOver === kode) style = mainStyle.highlight;
    return (
      <Region
        key={kode}
        kode={kode}
        stateIndex={stateIndex}
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
          onSwitchCategory && onSwitchCategory(e, kode, stateIndex, newState);
          setColorForHoldAndDragPaint(newState);
        }}
        onMouseLeave={e => {
          setHoveringOver(null);
        }}
      />
    );
  });
  const specialHoverItems = [];

  const clearElements = () => {
    while (specialHoverItems.length > 0) {
      const ele = specialHoverItems.pop();
      ele.element.setAttribute("stroke", ele.style.stroke);
      ele.element.setAttribute("strokeWidth", ele.style.strokeWidth);
      ele.element.setAttribute("filter", ele.style.filter);
      ele.element.setAttribute("fill", ele.style.fill);
      setCursor("default");
    }
  };

  const clickElement = (element) => {
    if (!element && !element.attributes && element.attributes["stateIndex"] === undefined) return;
    if (element.attributes["kode"].nodeValue === "Fi" && element.attributes["stateIndex"].nodeValue !== "3") {
      // console.log('clickElement', element.attributes["stateIndex"].nodeValue, element.attributes["kode"].nodeValue);
      onSwitchOtherCategory &&
        onSwitchOtherCategory(element.attributes["stateIndex"].nodeValue, element.attributes["kode"].nodeValue);
    }
  };

  const hoverElement = (element) => {
    if (!element && !element.attributes && element.attributes["stateIndex"] === undefined) return
    if (element.attributes["kode"].nodeValue === "Fi" && element.attributes["stateIndex"].nodeValue !== "3") {
      // console.log('hover', element.attributes, element.attributes["stateIndex"]);
      // console.log('events', i, element.nodeName, element.attributes["kode"].nodeValue);
      const tmpstate = states[element.attributes["kode"].nodeValue][`state${element.attributes["stateIndex"].nodeValue}`] ? parent.attributes["stateIndex"].nodeValue : 2;
      const tmpmainStyle = categories[tmpstate];
      specialHoverItems.push({element: element, style: tmpmainStyle.normal});
      element.setAttribute("stroke", tmpmainStyle.highlight.stroke);
      element.setAttribute("strokeWidth", tmpmainStyle.highlight.strokeWidth);
      element.setAttribute("filter", tmpmainStyle.highlight.filter);
      element.setAttribute("fill", tmpmainStyle.highlight.fill);
      setCursor("pointer");
    }
  };

  return (
    <svg
      style={{
        userSelect: "none",
        left: 0,
        top: 0,
        width: "100%",
        height: "auto",
        cursor: cursor
      }}
      preserveAspectRatio="none"
      viewBox={boundary.viewbox}
      onMouseLeave={e => {
        e.stopPropagation();
        setHoveringOver(null);
        setColorForHoldAndDragPaint(null);
        clearElements();
      }}
      onMouseUp={e => {
        e.stopPropagation();
        if (readOnly) return;
        setColorForHoldAndDragPaint(null);
      }}
      onMouseDown={e => {
        e.stopPropagation();
        if (readOnly) return;
        setColorForHoldAndDragPaint(null);
        clearElements();
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        elements.forEach((element) => {
          if (element.nodeName === "path") {
            clickElement(element.parentElement.parentElement);
          }
        });
      }}
      onMouseEnter={e => {
        e.stopPropagation();
        setColorForHoldAndDragPaint(null);
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        elements.forEach((element) => {
          if (element.nodeName === "path") {
            try {
              hoverElement(element.parentElement.parentElement);
            } catch(err) {}
          }
        });
      }}
      onMouseMove={e => {
        e.stopPropagation();
        clearElements();
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        elements.forEach((element) => {
          if (element.nodeName === "path") {
            try {
              hoverElement(element.parentElement.parentElement);
            } catch(err) {}
          }
        });
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
