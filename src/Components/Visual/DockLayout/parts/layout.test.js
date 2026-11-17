import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLayout, cloneLayout, groups, findNode, moveLayout, removeLayoutTab } from './layout.js';
const tree = () => normalizeLayout({ type:'split',id:'root',orientation:'horizontal',sizes:[30,70],children:[{type:'group',id:'a',tabs:['one','two'],activeTab:'one'},{type:'group',id:'b',tabs:['three'],activeTab:'three'}] },['one','two','three']);
test('DockLayout default layout is JSON-only, weights normalize and returned snapshots are independent',()=>{
 const root=tree();const copy=cloneLayout(root);copy.children[0].tabs.pop();assert.equal(groups(root)[0].tabs.length,2);
 assert.deepEqual(normalizeLayout(null,['a','b']),{type:'group',id:'main',tabs:['a','b'],activeTab:'a'});
 assert.deepEqual(JSON.parse(JSON.stringify(root)),root);
 assert.deepEqual(root.sizes,[30,70]);
});
test('DockLayout rejects duplicate/unknown/missing tabs, IDs, malformed splits, cycles and overflow',()=>{
 const cases=[
 {type:'group',id:'a',tabs:['one','one']}, {type:'group',id:'a',tabs:['other']}, {type:'group',id:'a',tabs:[]},
 {type:'split',id:'x',orientation:'diagonal',children:[]},
 {type:'split',id:'x',orientation:'horizontal',sizes:[1e308,1e308],children:[{type:'group',id:'a',tabs:['one']},{type:'group',id:'b',tabs:[]}]},
 {type:'split',id:'x',orientation:'horizontal',children:[{type:'group',id:'a',tabs:['one']},{type:'group',id:'a',tabs:[]}]},
 ];
 for (const sizes of [[1], [0,0], [-1,2], [NaN,1]]) cases.push({type:'split',id:'root',orientation:'horizontal',sizes,children:[{type:'group',id:'a',tabs:['one']},{type:'group',id:'b',tabs:[]}]});
 for(const value of cases)assert.throws(()=>normalizeLayout(value,['one']),TypeError);
 const cycle={type:'split',id:'x',orientation:'horizontal',children:[]};cycle.children=[cycle,cycle];assert.throws(()=>normalizeLayout(cycle,['one']),TypeError);
 let deep={type:'group',id:'last',tabs:['one']};for(let i=0;i<35;i++)deep={type:'split',id:`s${i}`,orientation:'vertical',children:[deep,{type:'group',id:`g${i}`,tabs:[]}]};
 assert.throws(()=>normalizeLayout(deep,['one']),TypeError);
});
test('DockLayout reorders within a group and treats no-op/invalid moves as no change',()=>{
 const root=tree();assert.deepEqual(findNode(moveLayout(root,'one','a',{index:1}),'a').tabs,['two','one']);
 assert.equal(moveLayout(root,'one','a',{index:0}),null);assert.equal(moveLayout(root,'one','missing'),null);assert.equal(moveLayout(root,'missing','a'),null);assert.equal(moveLayout(root,'one','a',{position:'other'}),null);
 assert.deepEqual(groups(root)[0].tabs,['one','two']);
});
test('DockLayout cross-group moves prune empty source groups and collapse unary splits',()=>{
 let root=moveLayout(tree(),'three','a',{index:1});assert.equal(root.type,'group');assert.equal(root.id,'a');assert.deepEqual(root.tabs,['one','three','two']);assert.equal(root.activeTab,'three');
 root=moveLayout(tree(),'one','b');assert.deepEqual(findNode(root,'a').tabs,['two']);assert.equal(findNode(root,'a').activeTab,'two');assert.deepEqual(findNode(root,'b').tabs,['three','one']);
});
for(const position of ['left','right','top','bottom'])test(`DockLayout ${position} split preserves each tab exactly once`,()=>{
 const root=moveLayout(tree(),'two','b',{position});normalizeLayout(root,['one','two','three']);
 const containing=groups(root).find(g=>g.tabs.includes('two'));assert.equal(containing.tabs.length,1);
 const split=root.children.find(n=>n.type==='split');assert.equal(split.orientation,['left','right'].includes(position)?'horizontal':'vertical');
 assert.equal(split.children[['left','top'].includes(position)?0:1].id,containing.id);
});
test('DockLayout closing the final tab leaves a reachable empty group',()=>{
 let root=tree();for(const id of ['one','two','three'])root=removeLayoutTab(root,id);
 assert.equal(root.type,'group');assert.deepEqual(root.tabs,[]);assert.equal(root.activeTab,'');assert.equal(removeLayoutTab(root,'absent'),null);
 assert.equal(moveLayout({type:'group',id:'a',tabs:['one'],activeTab:'one'},'one','a',{position:'left'}),null);
});
