// DockLayout's pure JSON tree validation and editing. No DOM or component instances.
export function groups(root) {
   if (!root) return [];
   return root.type === 'group' ? [root] : root.children.flatMap(groups);
}
export function findNode(root, id) {
   if (!root) return null;
   if (root.id === id) return root;
   return root.type === 'split' ? root.children.map(n => findNode(n, id)).find(Boolean) || null : null;
}
export function cloneLayout(root) {
   if (!root) return null;
   return root.type === 'group' ? { ...root, tabs: [...root.tabs] } : { ...root, sizes: [...root.sizes], children: root.children.map(cloneLayout) };
}
export function normalizeLayout(value, knownIds) {
   const known = new Set(knownIds);
   if (value == null) return { type: 'group', id: 'main', tabs: [...known], activeTab: [...known][0] || '' };
   const objects = new Set(), ids = new Set(), tabs = new Set();
   let count = 0;
   const visit = (node, depth) => {
      if (!node || typeof node !== 'object' || objects.has(node) || depth > 32 || ++count > 256) throw new TypeError('DockLayout: invalid, cyclic or oversized layout');
      objects.add(node);
      if (typeof node.id !== 'string' || !node.id || ids.has(node.id)) throw new TypeError('DockLayout: node IDs must be nonempty and unique');
      ids.add(node.id);
      if (node.type === 'group') {
         if (!Array.isArray(node.tabs)) throw new TypeError('DockLayout: a group needs tabs');
         const list = node.tabs.map(id => {
            if (typeof id !== 'string' || !known.has(id) || tabs.has(id)) throw new TypeError('DockLayout: unknown or repeated tab ID');
            tabs.add(id); return id;
         });
         return { type: 'group', id: node.id, ...(typeof node.label === 'string' ? { label: node.label } : {}), tabs: list, activeTab: list.includes(node.activeTab) ? node.activeTab : list[0] || '' };
      }
      if (node.type !== 'split' || !['horizontal','vertical'].includes(node.orientation) || !Array.isArray(node.children) || node.children.length < 2) throw new TypeError('DockLayout: a split needs an orientation and at least two children');
      const children = node.children.map(child => visit(child, depth + 1));
      if (node.sizes !== undefined && (!Array.isArray(node.sizes) || node.sizes.length !== children.length)) throw new TypeError('DockLayout: sizes must match the split children');
      const sizes = node.sizes || children.map(() => 1);
      if (sizes.some(n => !Number.isFinite(n) || n < 0) || !sizes.some(n => n > 0)) throw new TypeError('DockLayout: sizes must be finite nonnegative weights');
      const total = sizes.reduce((a,b) => a+b,0);
      if (!Number.isFinite(total)) throw new TypeError('DockLayout: size total must be finite');
      return { type: 'split', id: node.id, orientation: node.orientation, sizes: sizes.map(n => n / total * 100), children };
   };
   const root = visit(value, 0);
   if (tabs.size !== known.size) throw new TypeError('DockLayout: each item must occur exactly once in the layout');
   return root;
}
export function pruneLayout(root) {
   if (root.type === 'group') return root.tabs.length ? root : null;
   const remaining = root.children.map((child,i) => ({ child: pruneLayout(child), weight: root.sizes[i] })).filter(p => p.child);
   if (!remaining.length) return null;
   if (remaining.length === 1) return remaining[0].child;
   const total = remaining.reduce((sum,p) => sum+p.weight,0);
   return { ...root, children: remaining.map(p=>p.child), sizes: remaining.map(p=>total ? p.weight/total*100 : 100/remaining.length) };
}
function unique(root, prefix) {
   let n=1; while(findNode(root,`${prefix}-${n}`)) n++;
   return `${prefix}-${n}`;
}
function replace(root, id, value) {
   return root.id===id ? value : root.type==='split' ? {...root,children:root.children.map(n=>replace(n,id,value))} : root;
}
export function moveLayout(value, tabId, groupId, { index, position = 'center' } = {}) {
   if (!['center','left','right','top','bottom'].includes(position)) return null;
   let root = cloneLayout(value);
   const source = groups(root).find(g=>g.tabs.includes(tabId));
   const target = groups(root).find(g=>g.id===groupId);
   if (!source || !target || (position!=='center' && source===target && source.tabs.length===1)) return null;
   if (position === 'center' && source === target) {
      const at = Number.isInteger(index) ? Math.max(0, Math.min(index, target.tabs.length - 1)) : target.tabs.length - 1;
      if (source.tabs.indexOf(tabId) === at) return null;
   }
   source.tabs=source.tabs.filter(id=>id!==tabId);
   if(source.activeTab===tabId) source.activeTab=source.tabs[0]||'';
   if(position==='center') {
      const at=Number.isInteger(index)?Math.max(0,Math.min(index,target.tabs.length)):target.tabs.length;
      target.tabs.splice(at,0,tabId);target.activeTab=tabId;
   } else {
      const group={type:'group',id:unique(root,'group'),tabs:[tabId],activeTab:tabId};
      const split={type:'split',id:unique(root,'split'),orientation:['left','right'].includes(position)?'horizontal':'vertical',sizes:[50,50],children:['left','top'].includes(position)?[group,target]:[target,group]};
      root=replace(root,target.id,split);
   }
   const result = pruneLayout(root);
   try { return normalizeLayout(result, groups(value).flatMap(g => g.tabs)); }
   catch { return null; } // A split must not create a tree that cannot later be restored.
}
export function removeLayoutTab(value, tabId) {
   const root=cloneLayout(value);
   const group=groups(root).find(g=>g.tabs.includes(tabId));
   if(!group) return null;
   group.tabs=group.tabs.filter(id=>id!==tabId);
   if(group.activeTab===tabId) group.activeTab=group.tabs[0]||'';
   return pruneLayout(root)||{type:'group',id:group.id,tabs:[],activeTab:''};
}
