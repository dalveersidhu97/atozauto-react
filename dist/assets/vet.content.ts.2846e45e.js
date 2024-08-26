import{S as M}from"./comparison.utils.49eb01ae.js";import{k as L,m as C,a as O,n as b,l as G,f as E,I as y,c as S,p as I,d as A,b as x,e as R}from"./content.utils.cdfe0a71.js";import{d as w,c as D}from"./formatters.c3b942d2.js";import{s as P}from"./init.content.bbae9844.js";const N=(i,s="asc")=>i.sort((t,r)=>{const l=t[0].startTime,o=t[t.length-1].endTime,e=r[0].startTime,n=r[r.length-1].endTime;if(l!==e)return l-e;const a=o-l,c=n-e;return s==="asc"?a-c:c-a}),$=(i,s="asc")=>i.sort((t,r)=>{const l=t[0].startTime;let o=t[t.length-1].endTime;o<=l&&(o=o+24*60);const e=r[0].startTime;let n=r[r.length-1].endTime;n<=e&&(n=n+24*60);const a=o-l,c=n-e;return s==="asc"?a-c:c-a}),j=(i,s="asc",t,r)=>{const l=i.map(a=>[a]),o=N(l,s),e=[];for(let a=0;a<o.length;a++){const c=[...o[a]];let u=0;const m=c[0].startTime;for(let p=a+1;p<o.length;p++){const d=[...o[p]];let f=c[c.length-1].endTime,T=d[0].startTime;f<m&&(f=f+24*60);const g=T-f;u+=g,t(g)&&r(u)&&c.push(...d)}c.length>1&&e.push(c)}return e.push(...l),$(e,s)},W=(i,s)=>{const t=s.timeRules.filter(o=>o.type==="Gap");t.push({minutes:-1,op:"gt",type:"Gap"});const r=s.timeRules.filter(o=>o.type==="Total Gap");return r.push({minutes:-1,op:"gt",type:"Total Gap"}),j(i,s.preferedDuration==="Max"?"desc":"asc",o=>t.every(e=>b(o,e.op,e.minutes)),o=>r.every(e=>b(o,e.op,e.minutes)))},Q=(i,s,t)=>{let r=[],l=[];t:for(let e=0;e<t.length;e++){const n=t[e];let a=W(i,n);if(console.log({vetGroups:a}),!L(n.date,s))continue;e:for(let c=0;c<a.length;c++){const u=a[c],m=C([n],u);if(m){for(let d=0;d<l.length;d++){const f=l[d],T=f[0].startTime,g=f[f.length-1].endTime,v=u[0].startTime,q=u[u.length-1].endTime,V=T<v&&g<=v,B=v<T&&q<=T;if(!V&&!B)continue e}l.push(u);const p=u.map(d=>({vtoOrVET:d,filter:m}));if(r.push(...p),l.length>=n.maxGroups)continue t}}}return r=r.filter(e=>!e.vtoOrVET.claimed),console.log("Acceptable VET Groups",l),console.log("Acceptable VETS",{acceptables:r}),O(r,t)},h=(i,s,{isTestMode:t})=>{if(!document.querySelector('div[role="presentation"]'))return[];const l=[];return s.querySelectorAll('div[role="listitem"]').forEach(e=>{const n=e.querySelector('div[role="heading"]');if(n){let a=e.querySelector('button[data-test-id="AddOpportunityModalButton"]');if(t&&(a=e.querySelector('button[data-test-id="AddOpportunityModalButton"]')||e.querySelector('button[data-testid="OpportunityDetailsModalButton"]')||e.querySelector('button[data-testid="ViewDetailsButton"]')),a&&n.textContent){const c=n.textContent.split(" ")[0],u=c.split("-")[0],m=c.split("-")[1],p=D(u),d={button:a,date:i,startTime:p,endTime:D(m,p),timeStr:c,claimed:!1};l.push(d)}}}),l},H=(i,{isTestMode:s})=>{const t=document.querySelector('div[role="presentation"]');if(!t)return[];const r=t.querySelector('div[data-test-id="ClaimedShiftsList"]'),l=t.querySelectorAll(':scope > div[data-test-component="StencilReactCol"]'),o=l.length===2?l[1]:void 0,e=o?h(i,o,{isTestMode:s}):[];let n=r?h(i,r,{isTestMode:s}):[];return n=n.map(a=>({...a,claimed:!0})),[...n,...e]},J=(i,s,t)=>{var r;if((r=i.button)==null||r.click(),s){setTimeout(()=>S(()=>t(!0)),2e3);return}setTimeout(()=>{I(/^yes, add shift$/i,()=>{let o=1;const e=setInterval(()=>{o>60&&(clearInterval(e),S(t)),A(/^done$/i,()=>{clearInterval(e),t(!0)}),A(/^ok$/i,()=>{clearInterval(e),t(!1)}),o++},100)})||setTimeout(()=>S(t),500)},0)},K=(i,s)=>{let t=0;const r=500,o=5e3/r,e=setInterval(()=>{if(t++,t>o)return console.log("Loading Wait Time Over"),clearInterval(e),s();let n=!1;const a=document.querySelector('div[role="presentation"]');if(!a)return s();const c=a.querySelectorAll(':scope > div[data-test-component="StencilReactCol"]');if(c.length===2){const u=c[1];if(h(i,u,{isTestMode:!0}).length>0)n=!0;else{const p=u.querySelector('div[role="listitem"]');if(p){const d=p.querySelector('div[data-test-component="StencilText"]');if(d){const f=d.textContent||"",T=/There are \d+ available shifts\./;n=!f.includes("There aren\u2019t any available shifts.")&&!T.test(f)}}}}else console.log("No Third Row found in Presentation"),n=!0;n&&(clearInterval(e),s())},r)},U=i=>{const s=/\b(\d+)\s+shifts?\s+available\b/,t=i.match(s);return t?+t[1]:(console.log("No shifts available information found."),NaN)},F=(i,s,t,r,l)=>{const o=i.split(" "),e=o[0]+" "+parseInt(o[1],10).toString(),n=document.querySelector('div[data-test-id="day-selector"]');if(!n){console.log("No day Selector"),s();return}const a=n.querySelector('div[role="tablist"]');let c=!1;const u=`div[aria-label*="${e.replace(" ","  ")}"]`,m=n.querySelector(u);if(!m){console.log("Day Tab not found for ",e),s();return}const p=m.getAttribute("aria-label")||"",d=U(p);console.log(d,"Shifts Available",i),r&&a.scroll({left:m.offsetLeft-a.offsetLeft,behavior:"smooth"}),m&&(m.click(),d===0&&!l?setTimeout(s,10):(t&&setTimeout(()=>K(i,s),10),!t&&setTimeout(s,10)),c=!0,console.log("Selected Date: ",e)),c||console.log("Day Tab not found for ",e)},z=(i=[])=>i.filter((s,t)=>i.indexOf(s)===t),X=(i,s,t,r)=>{const{testMode:l}=r,o=l==="On";let e=H(s,{isTestMode:o});console.log("Ready VETS",{vets:e});let n=Q(e,s,i);console.log("Acceptable Sorted As Filters VETS",{acceptablesSortedAsFilters:n});const a=()=>x(`${n.length} Acceptable VETs`);y.add(a),G(n,(c,u,m)=>{const p=c.vtoOrVET,d=c.filter,f=()=>x(`Accepting VET...</br>(${m+1} of ${n.length})`);y.add(f),J(p,o,T=>{d.deleteAfterMatch&&T&&R(M.vetFilters,d),u()})},t,"AcceptVETSLooper",200)},Y=i=>{const s=i.map(n=>n.date.split(",")[0]),t=z(s),l=new URLSearchParams(window.location.search).get("date");let o="",e=t[0];return l&&(o=w(l),t.includes(o)&&(t.splice(t.indexOf(o),1),t.unshift(o)),console.log("Pre Selected Date is",o)),{selectableDates:t,preSelectedDate:o,nextPreSelectedDate:e}},Z=i=>{console.log({preference:i}),i.refreshMode;const s=i.testMode==="On";chrome.storage.local.get(M.vetFilters,function(t){const r=t.vetFilters||[];console.log("vetFilters",r);const{selectableDates:l,preSelectedDate:o,nextPreSelectedDate:e}=Y(r);G(l,(n,a,c)=>{F(n,()=>{X(r,n,a,i)},!(n===o),!0,s)},()=>{e&&F(e,()=>{},!1,!0,s),E(r,i)},"SelectDayLooper",0,0)})};P(Z);
