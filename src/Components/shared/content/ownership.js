// Tabs, SplitPane, DockLayout, OverflowList and TransferList: transfer live components without stale destroy ancestry.
// Controller 4.x stores ancestry separately; re-registering would wrap update() again.
// Keep this compatibility bridge here until the framework exposes a reparent operation.
export function reparentNodes(nodes, owner = null) {
   const controller = slice.controller;
   // Initial constructors/init may run before Slice assigns the owner an ID.
   // The initial framework DOM walk establishes ancestry after registration.
   if (owner && !owner.sliceId) return;
   const visit = (node, parent) => {
      if (!(node instanceof Element)) return;
      let next = parent;
      if (node.sliceId && controller.activeComponents.get(node.sliceId) === node) {
         const previous = node.parentComponent;
         if (previous?.sliceId && previous !== parent) {
            const children = controller.childrenIndex.get(previous.sliceId);
            children?.delete(node.sliceId);
            if (children?.size === 0) controller.childrenIndex.delete(previous.sliceId);
         }
         node.parentComponent = parent;
         node._depth = parent ? (parent._depth || 0) + 1 : 0;
         if (parent?.sliceId) {
            if (!controller.childrenIndex.has(parent.sliceId)) controller.childrenIndex.set(parent.sliceId, new Set());
            controller.childrenIndex.get(parent.sliceId).add(node.sliceId);
         }
         next = node;
      }
      for (const child of node.children) visit(child, next);
   };
   for (const node of nodes) visit(node, owner);
}

// Preserve the actual focused control, text selection and scroll offsets across DOM moves.
export function captureView(nodes) {
   const roots = [...nodes].filter(n => n instanceof Element);
   const active = document.activeElement;
   const focused = roots.some(root => root === active || root.contains(active)) ? active : null;
   const selection = focused && typeof focused.selectionStart === 'number'
      ? [focused.selectionStart, focused.selectionEnd, focused.selectionDirection] : null;
   const scroll = roots.flatMap(root => [root, ...root.querySelectorAll('*')]).filter(n => n.scrollTop || n.scrollLeft).map(n => [n, n.scrollLeft, n.scrollTop]);
   return () => {
      if (focused?.isConnected && !focused.closest('[hidden], [inert]')) {
         focused.focus({ preventScroll: true });
         if (selection) focused.setSelectionRange?.(...selection);
      }
      for (const [node, x, y] of scroll) { node.scrollLeft = x; node.scrollTop = y; }
   };
}
