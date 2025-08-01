import { useWaitFor } from './useWaitFor';


// When working with hooks that start fetching data in useEffect on load,
// there're sometimes cases when we want to wait until all data is fetched.
// In most cases such a hook will expose states like isLoaded, isError, etc.
// Based on these states we can create anew hook that will also expose a promise.
// This promise will resolve when certain hook's state (f.e. isLoaded) matches the desired state (f.e. true).
// And it will reject when certain hook's state (f.e. isError) matches the desired error state (f.e. true).
export const useWaitForHook = <
  THookReturnType,
  THook extends () => THookReturnType,
  TState,
  TReject,
>(
  hook: THook,
  stateExtractor: (value: THookReturnType) => TState,
  stateValue: TState,
  rejectOptions?: {
    stateExtractor: (value: THookReturnType) => TReject;
    value: TReject;
  },
) => {
  const value = hook();
  const state = stateExtractor(value);
  const promise = useWaitFor(
    state,
    stateValue,
    rejectOptions
      ? {
          state: rejectOptions?.stateExtractor(value),
          value: rejectOptions?.value,
        }
      : undefined,
  );

  return { value, waitFor: promise };
};
