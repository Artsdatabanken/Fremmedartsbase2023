import React, { useState, useEffect } from "react";

// Restful GET => JSON
const useRestApi = (url, data, onComplete) => {
  const [status, setStatus] = useState({});

  useEffect(() => {
    const abortController = new AbortController();
    async function download(url) {
      setStatus({ isLoading: true });
      const params = data
        ? {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }
        : undefined;
      const response = await fetch(url, params);
      if (response.status !== 200)
        return setStatus({
          error: { http: response.status, message: response.error }
        });
        if (!abortController.signal.aborted) 
          onComplete(await response.json());
      setStatus({});
    }
    download(url)
    return () => {
      abortController.abort();
    };
  }, [url]);

  return [status];
};

export default useRestApi;
