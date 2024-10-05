export const throttle = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: any[]) {
    const context: any = this;
    clearTimeout(timeout as NodeJS.Timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};
