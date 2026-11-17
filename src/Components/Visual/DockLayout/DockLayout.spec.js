import { test, expect } from '../../../../playwright/harness/sliceFixtures.js';
const items = [{ id:'one',label:'One',panel:'First panel' },{ id:'two',label:'Two',panel:'Second panel' },{ id:'three',label:'Three',panel:'Third panel' }];
const group = (id,tabs) => ({type:'group',id,tabs,activeTab:tabs[0]});
const layout = {type:'split',id:'root',orientation:'horizontal',sizes:[45,55],children:[group('a',['one','two']),group('b',['three'])]};

test('DockLayout renders Tabs/SplitPane with labels, silent setters and change payloads',async({mount})=>{
 const c=await mount('DockLayout',{items,layout,ariaLabel:'Review workspace'},{spies:['onChange']});
 await c.component.evaluate(el=>{el.style.height='360px';});
 await expect(c.component).toHaveAttribute('role','region');await expect(c.component).toHaveAttribute('aria-label','Review workspace');
 await expect(c.locator('slice-tabs')).toHaveCount(2);await expect(c.locator('slice-split-pane')).toHaveCount(1);
 expect(await c.events('onChange')).toBe(0);
 await c.component.evaluate(el=>el.moveTab('one','b'));
 const args=await c.eventArgs('onChange');expect(args.at(-1)[1]).toMatchObject({reason:'move',tabId:'one',groupId:'b'});
 expect(c.pageErrors()).toEqual([]);
});

test('DockLayout preserves component, focus, text selection and scroll across moves and splits',async({mount})=>{
 const c=await mount('DockLayout');
 const result=await c.component.evaluate(async el=>{
   el.style.height='360px';
   const editor=document.createElement('textarea');editor.value='Unsaved draft';editor.style.height='500px';
   const child=await slice.build('Button',{value:'Save'});const box=document.createElement('div');box.append(editor,child);
   let builds=0;el.items=[{id:'a',label:'Editor',panel:()=>{builds++;return box;}},{id:'b',label:'Preview',panel:'Preview'}];await el.update();
   const initial=el.getTabs('main').getPanel('a');editor.focus();editor.setSelectionRange(2,7);
   initial.parentElement.scrollTop=120;
   await el.moveTab('a','main',{position:'right'});
   const destination=el.getLayout().children.find(g=>g.tabs.includes('a')).id;
   const same=el.getTabs(destination).getPanel('a')===initial;
   const focused=document.activeElement===editor;const selected=[editor.selectionStart,editor.selectionEnd];
   const scroll=el.getTabs(destination).$panels.scrollTop;
   await el.moveTab('a','main');
   return {same,focused,selected,scroll,builds,value:editor.value,live:slice.controller.activeComponents.has(child.sliceId),groups:el.getLayout().type};
 });
 expect(result).toMatchObject({same:true,focused:true,selected:[2,7],scroll:120,builds:1,value:'Unsaved draft',live:true,groups:'group'});
});

test('DockLayout restores a permutation atomically and rejects invalid trees',async({mount})=>{
 const c=await mount('DockLayout',{items,layout});
 expect(await c.component.evaluate(async el=>{
   const nodes=new Map(el.items.map(item=>[item.id,el.getTabs(item.id==='three'?'b':'a').getPanel(item.id)]));
   const root=el.getLayout();root.children[0].tabs=['three'];root.children[0].activeTab='three';root.children[1].tabs=['two','one'];root.children[1].activeTab='one';
   await el.restoreLayout(JSON.parse(JSON.stringify(root)));
   const same=nodes.get('one')===el.getTabs('b').getPanel('one')&&nodes.get('three')===el.getTabs('a').getPanel('three');
   const before=JSON.stringify(el.getLayout());let rejected=false;
   try {await el.restoreLayout({type:'group',id:'bad',tabs:['missing']});}catch{rejected=true;}
   return {same,rejected,unchanged:before===JSON.stringify(el.getLayout())};
 })).toEqual({same:true,rejected:true,unchanged:true});
});

test('DockLayout keyboard reorder, split, move between groups and visible move control',async({mount})=>{
 const c=await mount('DockLayout',{items});
 const first=c.locator('[role=tab][data-tab-id=one]');
 await first.press('Control+Shift+ArrowRight');
 await expect.poll(()=>c.component.evaluate(el=>el.getLayout().tabs)).toEqual(['two','one','three']);
 await first.press('Control+Alt+ArrowDown');
 await expect(c.locator('slice-tabs')).toHaveCount(2);
 await first.press('Control+Shift+PageUp');
 await expect(c.locator('slice-tabs')).toHaveCount(1);
 const select=c.locator('.slice-dock-layout__destination');await select.selectOption('right');
 await c.locator('.slice-dock-layout__move').click();await expect(c.locator('slice-tabs')).toHaveCount(2);
});

test('DockLayout native pointer drag moves tabs while cancellation leaves the model intact',async({mount,page})=>{
 const c=await mount('DockLayout',{items,layout});await c.component.evaluate(el=>{el.style.cssText='width:900px;height:400px';});
 const source=c.locator('[data-dock-group=a] [role=tab][data-tab-id=one]');
 const destination=c.locator('[data-dock-group=b]');
 const start=await source.boundingBox();const end=await destination.boundingBox();
 await page.mouse.move(start.x+20,start.y+12);await page.mouse.down();await page.mouse.move(end.x+end.width/2,end.y+end.height/2,{steps:8});
 await expect(c.locator('.slice-dock-layout__preview')).toBeVisible();await page.mouse.up();
 await expect.poll(()=>c.component.evaluate(el=>el.getLayout().children[1].tabs)).toEqual(['three','one']);
 const moved=await c.locator('[data-dock-group=b] [role=tab][data-tab-id=one]').boundingBox();
 const before=await c.component.evaluate(el=>JSON.stringify(el.getLayout()));
 await page.mouse.move(moved.x+20,moved.y+12);await page.mouse.down();await page.mouse.move(100,200,{steps:5});await page.keyboard.press('Escape');await page.mouse.up();
 expect(await c.component.evaluate(el=>JSON.stringify(el.getLayout()))).toBe(before);
 await expect(c.locator('.slice-dock-layout__preview')).toBeHidden();
});

test('DockLayout close veto, disabled editing, translations and final empty state',async({mount})=>{
 const c=await mount('DockLayout',{items:[items[0]]});
 const result=await c.component.evaluate(async el=>{
   el.onBeforeClose=()=>false;const veto=await el.closeTab('one');
   el.onBeforeClose=null;el.disabled=true;const locked=await el.closeTab('one');
   el.texts={empty:'Sin pestañas',move:'Mover'};el.disabled=false;const closed=await el.closeTab('one');
   return {veto,locked,closed,tabs:el.getLayout().tabs};
 });
 expect(result).toEqual({veto:false,locked:false,closed:true,tabs:[]});
 await expect(c.locator('.slice-dock-layout__empty')).toBeVisible();await expect(c.locator('.slice-dock-layout__empty')).toHaveText('Sin pestañas');
});

test('DockLayout destroys all owned content after repeated restructuring, including never-selected sources',async({mount})=>{
 const c=await mount('DockLayout');
 expect(await c.component.evaluate(async el=>{
   const child=await slice.build('Button',{value:'Live'});const unused=await slice.build('Button',{value:'Never selected'});
   el.items=[{id:'a',label:'A',panel:child},{id:'b',label:'B',panel:unused}];await el.update();
   const owned=[child.sliceId,unused.sliceId];
   await el.moveTab('a','main',{position:'left'});await el.moveTab('a','main');
   const infrastructure=[...el.querySelectorAll('[slice-id]')].map(node=>node.sliceId);
   slice.controller.destroyComponent(el);
   return [...owned,...infrastructure].every(id=>!slice.controller.activeComponents.has(id));
 })).toBe(true);
});
