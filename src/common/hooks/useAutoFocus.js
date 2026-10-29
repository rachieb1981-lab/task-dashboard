import { useRef, useEffect } from 'react';

/**
 * Custom hook to manage auto-focusing an input element on mount.
 * @returns {React.RefObject} Ref to be attached to the target input element.
 */
export function useAutoFocus() {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return inputRef;
}

export default useAutoFocus;
