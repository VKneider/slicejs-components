// OverflowList's pure width budget: mandatory items first, then priority and edge order.
export function fitItems(
   items,
   available,
   moreWidth,
   gap = 0,
   minVisible = 0,
   collapseFrom = 'end',
) {
   const width = (item) => Math.max(0, Number(item.width) || 0);
   const space = Math.max(0, Number(available) || 0);
   const separation = Math.max(0, Number(gap) || 0);
   const total =
      items.reduce((sum, item) => sum + width(item), 0) +
      Math.max(0, items.length - 1) * separation;
   if (total <= space)
      return {
         visible: items.map((_, i) => i),
         overflow: [],
         constrained: false,
      };
   const order = items.map((_, i) => i);
   if (collapseFrom === 'start') order.reverse();
   const required = new Set(
      order.slice(0, Math.max(0, Math.floor(minVisible) || 0)),
   );
   items.forEach((item, i) => {
      if (item.pinned) required.add(i);
   });
   const used = new Set(required);
   let budget =
      Math.max(0, Number(moreWidth) || 0) +
      [...used].reduce((sum, i) => sum + width(items[i]) + separation, 0);
   const constrained = budget > space;
   const candidates = order
      .filter((i) => !used.has(i))
      .sort(
         (a, b) =>
            (Number(items[b].priority) || 0) - (Number(items[a].priority) || 0),
      );
   for (const i of candidates)
      if (budget + width(items[i]) + separation <= space) {
         used.add(i);
         budget += width(items[i]) + separation;
      }
   return {
      visible: items.map((_, i) => i).filter((i) => used.has(i)),
      overflow: items.map((_, i) => i).filter((i) => !used.has(i)),
      constrained,
   };
}
