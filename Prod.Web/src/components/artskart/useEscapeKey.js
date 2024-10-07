import React, { useEffect } from "react";

const useEscapeKey = (inputRef, onEscape) => {
    useEffect(() => {
        if (!inputRef.current) return
        const handleEsc = event => {
            if (event.keyCode !== 27) return;
            event.stopPropagation();
            onEscape();
        };
        inputRef.current.addEventListener("keydown", handleEsc);

        return () => {
            inputRef.current.removeEventListener("keydown", handleEsc);
        };
    }, [inputRef.current]);
};

export default useEscapeKey;
