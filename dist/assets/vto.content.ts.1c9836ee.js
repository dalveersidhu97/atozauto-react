import{S as O,a as b}from"./comparison.utils.08c82949.js";import{g as S,i as h,a as x,I as T,l as y,f as C,c as m,p as F,b as g,r as I,d as q,e as M}from"./content.utils.1be2cea8.js";import{c as v}from"./formatters.738ad4ac.js";import{s as B}from"./init.content.8bae4b55.js";const E=({isTestMode:e})=>{const c=[];return document.querySelectorAll('div[data-test-component="StencilExpander"]').forEach(t=>{var i;if(!t)return;const s=((i=t.querySelector("h2"))==null?void 0:i.innerText)||"",o=t.querySelector('div[data-test-id="VtoForDay_countIcon"]');if(!e&&(!o||!+(o.textContent||"")))return;const l=t.querySelector('div[data-test-component="StencilExpanderContent"]');if(!l)return;l.querySelectorAll('div[data-test-component="StencilReactCard"]').forEach(r=>{const u=r.querySelector("button");if(u&&u.innerText==="Accept"||e){const d=(r.querySelectorAll('div[data-test-component="StencilText"]')[0].textContent||"").split(" - "),A=v(d[0]),V=v(d[1]);c.push({date:s,startTime:A,endTime:V,button:u})}})}),c},$=(e,c,n)=>{var t;if(console.log("Click VTO Button",e),(t=e.button)==null||t.click(),c){setTimeout(()=>m(n),1e3);return}setTimeout(()=>{F(/^Accept VTO$/i,()=>{I();let o=1;const l=setInterval(()=>{o>60&&(clearInterval(l),console.log("Ok button not found. Closing Modal"),m(n)),q(/^ok$/i,()=>{clearInterval(l),n()}),o++},100)})||(setTimeout(()=>m(n),500),console.log("Accept VTO Button Not Found"))},1e3)},j=(e,c,{isTestMode:n})=>{let t=E({isTestMode:n});console.log("Ready VTOs",{vtos:t});let s=[];for(let a=0;a<t.length;a++){const i=t[a],r=h(e,i);r&&s.push({vto:i,filter:r})}console.log("Acceptable VTOs",{acceptables:s});const o=x(s,e);console.log("Acceptable Sorted As Filters VTOs",{acceptablesSortedAsFilters:o});const l=()=>g(`${o.length} Acceptable VTOs`);T.add(l),y(o,(a,i,r)=>{const u=a.vto,f=a.filter,p=()=>g(`Accepting VTO...</br>(${r+1} of ${o.length})`);T.add(p),$(u,n,()=>{!n&&M(O.vtoFilters,f),t=t.filter(d=>!b(d,u)),i()})},c,"AcceptVTOsLooper",200)},L=e=>{console.log({preference:e}),chrome.storage.local.get(O.vtoFilters,function({vtoFilters:c}){e.refreshMode;const n=e.testMode==="On",t=S().name||"",s=(c||[]).filter(o=>o.forName.toLowerCase()===t.toLowerCase())||[];console.log("filters",s),s.length&&j(s,()=>{C(s,e)},{isTestMode:n})})};B(L);
