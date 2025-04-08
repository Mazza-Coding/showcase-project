export interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout | null = null;
  let funcArgs: Parameters<T> | null = null;

  const later = () => {
    timeout = null;
    if (funcArgs) {
      func(...funcArgs);
      funcArgs = null;
    }
  };

  const debounced = (...args: Parameters<T>): void => {
    funcArgs = args;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      funcArgs = null;
    }
  };

  return debounced;
}
