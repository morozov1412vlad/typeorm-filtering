import { useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

export const useWaitFor = <TState, TReject>(
  state: TState,
  value: TState,
  rejectOptions?: { state: TReject; value: TReject },
) => {
  const resolveRef = useRef<() => void>();
  const rejectRef = useRef<() => void>();
  const promiseRef = useRef<Promise<void>>(
    new Promise((resolve, reject) => {
      if (isEqual(state, value)) {
        resolve();
        return;
      }
      if (rejectOptions && isEqual(rejectOptions.state, rejectOptions.value)) {
        reject();
        return;
      }
      resolveRef.current = resolve;
      rejectRef.current = reject;
    }),
  );

  useEffect(() => {
    if (isEqual(state, value) && resolveRef.current) {
      resolveRef.current();
    }
  }, [state, value]);

  useEffect(() => {
    if (
      rejectOptions &&
      isEqual(rejectOptions.state, rejectOptions.value) &&
      rejectRef.current
    ) {
      rejectRef.current();
    }
  }, [rejectOptions]);

  return promiseRef.current;
};
