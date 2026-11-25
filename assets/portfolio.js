'use strict';
const projects={"workforce-explorer-360":{"title":"Workforce Explorer 360°","category":"Workforce","description":"Drill into organizational units, compare staffing scenarios and inspect workforce composition.","hint":"Select a month, click a row to drill down, and use the back/home controls."},"financial-bridge":{"title":"Financial Variance Bridge","category":"Finance","description":"Reconcile budget and latest estimates through additive contribution analysis.","hint":"Switch the reference and select a contribution to inspect its monthly profile."},"hierarchical-master-table":{"title":"Expense Hierarchy","category":"Finance","description":"Trace cost differences through organizational detail without counting parents twice.","hint":"Select a period and drill into a unit or team; switch sorting to focus on variance."},"expense-trend-explorer":{"title":"Expense Trend Explorer","category":"Finance","description":"Distinguish actuals, a frozen forecast, budget and the latest estimate.","hint":"Select a reporting horizon and inspect the monthly series."},"temporal-navigator":{"title":"Temporal Navigator","category":"Interaction","description":"Explore arbitrary reporting periods with independent month selections.","hint":"Toggle individual months; reset to include all periods."},"workforce-master-table":{"title":"Workforce Snapshot Hierarchy","category":"Workforce","description":"Compare staffing at a selected point in time rather than summing monthly snapshots.","hint":"Select a month and drill into the hierarchy."},"workforce-bridge":{"title":"Workforce Variance Bridge","category":"Workforce","description":"Explain staffing differences across business units.","hint":"Switch the reference and select a contribution."},"workforce-evolution":{"title":"Workforce Evolution","category":"Workforce","description":"Compare monthly staffing scenarios and the actual-data cutoff.","hint":"Choose a horizon and inspect monthly values."},"budget-scenario-comparator":{"title":"Budget Scenario Comparator","category":"Finance","description":"Compare accumulated cost under two independently selected scenarios.","hint":"Switch scenario A and B and adjust the horizon."},"kpi-library":{"title":"Planning KPI Library","category":"Finance","description":"Explore cost, variance and day-weighted staffing indicators.","hint":"Change the reporting horizon to update the indicators."},"workforce-explorer":{"title":"Workforce Explorer — First Edition","category":"Workforce","description":"Explore a pre-aggregated organizational tree and staffing trend.","hint":"Select the month, scenario and organizational node."}};
const $=id=>document.getElementById(id);
let active='workforce-explorer-360', view=null, serial=0, controller=null;
const buttons=[...document.querySelectorAll('.project')];
function setTheme(theme){document.documentElement.dataset.theme=theme;$('theme').textContent=theme==='dark'?'Light mode':'Dark mode';try{localStorage.setItem('rg-theme',theme)}catch{}}
try{const t=localStorage.getItem('rg-theme');if(t==='light'||t==='dark')setTheme(t)}catch{}
$('theme').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
async function load(id){
 if(!Object.hasOwn(projects,id))return;
 active=id;const ticket=++serial;controller?.abort();controller=new AbortController();
 if(view){view.finalize();view=null}
 const p=projects[id],base='components/'+id+'/';
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
 $('project-title').textContent=p.title;$('project-category').textContent=p.category.toUpperCase();$('project-description').textContent=p.description;$('project-hint').textContent=p.hint;

 $('status').setAttribute('role','status');$('status').textContent='Loading visualization…';$('chart').replaceChildren();
 const target=document.createElement('div');$('chart').append(target);
 try{
  if(typeof window.vegaEmbed!=='function')throw Error('Vega runtime could not load. Check your connection and retry.');
  const response=await fetch(base+'standalone.json',{signal:controller.signal});if(!response.ok)throw Error('Specification unavailable ('+response.status+').');
  const spec=await response.json();if(document.fonts){await Promise.race([Promise.all([400,500,600,700].map(w=>document.fonts.load(w+' 14px Poppins'))).catch(()=>{}),new Promise(r=>setTimeout(r,2500))]);}if(ticket!==serial)return;
  const result=await vegaEmbed(target,spec,{renderer:'svg',actions:false});
  if(ticket!==serial){result.view.finalize();return}
  view=result.view;$('status').textContent='Live Vega rendering · Synthetic data · Scroll horizontally on small screens.';
 }catch(error){if(ticket!==serial||error.name==='AbortError')return;$('status').setAttribute('role','alert');$('status').textContent='Demo unavailable: '+error.message+' Use Reset demo to retry.';target.replaceChildren()}
}
buttons.forEach(b=>b.addEventListener('click',()=>load(b.dataset.id)));
document.querySelectorAll('[data-filter]').forEach(filter=>filter.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(f=>f.setAttribute('aria-pressed',String(f===filter)));
 buttons.forEach(b=>b.hidden=filter.dataset.filter!=='All'&&b.dataset.category!==filter.dataset.filter);
 if(buttons.find(b=>b.dataset.id===active)?.hidden){const first=buttons.find(b=>!b.hidden);if(first)load(first.dataset.id)}
}));
$('reset-demo').addEventListener('click',()=>load(active));load(active);

const full=$('fullscreen-demo');if(full){if(!document.fullscreenEnabled)full.hidden=true;full.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.viewer').requestFullscreen()}catch{ $('status').textContent='Full screen is unavailable in this browser.' }});document.addEventListener('fullscreenchange',()=>{full.textContent=document.fullscreenElement?'Exit full screen':'Full screen'});}
