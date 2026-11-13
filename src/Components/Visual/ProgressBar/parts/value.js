// ProgressBar's finite numeric domain, independent of prop application order.
export function progressValue(value, max) {
   const limit = Number(max);
   const upper = Number.isFinite(limit) && limit > 0 ? limit : 100;
   const n = Number(value);
   const amount = Number.isFinite(n) ? Math.min(upper, Math.max(0, n)) : 0;
   return { value: amount, max: upper, ratio: amount / upper };
}
