import React, { useRef, useState } from "react";
import useOnClickOutside from "../fylkesforekomst/useOnClickOutside";
import Artskartparametre from "./Artskartparametre";
import * as Xcomp from "../observableComponents";
import useEscapeKey from "./useEscapeKey";
import useFocus from "./useFocus";

const Utvalg = ({ utvalg }) => {
  const closeModal = () => {
    setModalOpen(false);
  };

  const refUtvalg = useRef();
  const [isModalOpen, setModalOpen] = useState(false);
  const [refDropDown, setFocusUtvalg] = useFocus();
  // useEscapeKey(refDropDown, closeModal);
  useOnClickOutside(refUtvalg, closeModal);
  return (
    <div ref={refUtvalg} style={{ float: "left" }}>
      <Xcomp.Button
        onClick={() => {
          setModalOpen(!isModalOpen);
          setFocusUtvalg();
        }}
      >
        Utvalg ⧩
      </Xcomp.Button>
      <div ref={refDropDown} style={{ position: "absolute", zIndex: -1 }}>
        {isModalOpen && <Artskartparametre utvalg={utvalg} />}
      </div>
    </div>
  );
};

export default Utvalg;
