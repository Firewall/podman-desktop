import{T as oe,U as ce,V as le,n as ue,W as fe,X as S,Y as d,Z as j,_ as F,$ as h,l as C,v as k,p as I,F as U,k as m,f as p,r as A,a as y,b as M,a0 as ye,a1 as de,x as q,c as ge,t as me,a2 as pe,a3 as xe}from"./props-CebqUrXu.js";import{y as _e,g as B}from"./index-7SSfYZ8z.js";function ve(t,e,...r){var s=t,n=ue,i;oe(()=>{n!==(n=e())&&(i&&(fe(i),i=null),i=le(()=>n(s,...r)))},ce)}var be=Object.create,L=Object.defineProperty,Ce=Object.getOwnPropertyDescriptor,Ee=Object.getOwnPropertyNames,Oe=Object.getPrototypeOf,Se=Object.prototype.hasOwnProperty,we=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),Ne=(t,e,r,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Ee(e))!Se.call(t,n)&&n!==r&&L(t,n,{get:()=>e[n],enumerable:!(s=Ce(e,n))||s.enumerable});return t},Ae=(t,e,r)=>(r=t!=null?be(Oe(t)):{},Ne(!t||!t.__esModule?L(r,"default",{value:t,enumerable:!0}):r,t)),he=we(t=>{Object.defineProperty(t,"__esModule",{value:!0}),t.isEqual=function(){var e=Object.prototype.toString,r=Object.getPrototypeOf,s=Object.getOwnPropertySymbols?function(n){return Object.keys(n).concat(Object.getOwnPropertySymbols(n))}:Object.keys;return function(n,i){return function c(a,o,u){var f,x,l,g=e.call(a),R=e.call(o);if(a===o)return!0;if(a==null||o==null)return!1;if(u.indexOf(a)>-1&&u.indexOf(o)>-1)return!0;if(u.push(a,o),g!=R||(f=s(a),x=s(o),f.length!=x.length||f.some(function(w){return!c(a[w],o[w],u)})))return!1;switch(g.slice(8,-1)){case"Symbol":return a.valueOf()==o.valueOf();case"Date":case"Number":return+a==+o||+a!=+a&&+o!=+o;case"RegExp":case"Function":case"String":case"Boolean":return""+a==""+o;case"Set":case"Map":f=a.entries(),x=o.entries();do if(!c((l=f.next()).value,x.next().value,u))return!1;while(!l.done);return!0;case"ArrayBuffer":a=new Uint8Array(a),o=new Uint8Array(o);case"DataView":a=new Uint8Array(a.buffer),o=new Uint8Array(o.buffer);case"Float32Array":case"Float64Array":case"Int8Array":case"Int16Array":case"Int32Array":case"Uint8Array":case"Uint16Array":case"Uint32Array":case"Uint8ClampedArray":case"Arguments":case"Array":if(a.length!=o.length)return!1;for(l=0;l<a.length;l++)if((l in a||l in o)&&(l in a!=l in o||!c(a[l],o[l],u)))return!1;return!0;case"Object":return c(r(a),r(o),u);default:return!1}}(n,i,[])}}()});Ae(he());var ke=t=>t.toLowerCase().replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,"-").replace(/-+/g,"-").replace(/^-+/,"").replace(/-+$/,"");const Te=t=>t.split("-").map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(""),je=t=>ke(t.replace(/([A-Z])/g," $1").trim()),K=t=>Te(je(t)),T="storybook-stories-extractor-context";function X(t){let e=d(t.isExtracting),r=d(t.register);return{get isExtracting(){return e},get register(){return r}}}function Fe(t){const{stories:e}=t,r=X({isExtracting:!0,register:s=>{e.set(s.exportName??K(s.name),s)}});S(T,r)}function Re(){return j(T)||S(T,X({isExtracting:!1,register:()=>{}})),F(T)}const D="storybook-story-renderer-context";function Pe(t){let e=h(d(t.currentStoryExportName)),r=h(d(t.args)),s=h(d(t.storyContext));function n(i){k(e,d(i.currentStoryExportName)),k(r,d(i.args)),k(s,d(i.storyContext))}return{get args(){return C(r)},get storyContext(){return C(s)},get currentStoryExportName(){return C(e)},set:n}}function Ue(){const t=Pe({currentStoryExportName:void 0,args:{},storyContext:{}});S(D,t)}function W(){return j(D)||Ue(),F(D)}const E="storybook-stories-template-snippet-context";function G(){let t=h(void 0);function e(r){k(t,d(r))}return{get template(){return C(t)},set:e}}function De(){return j(E)||S(E,G()),F(E).template}function $e(t){j(E)||S(E,G()),F(E).set(t)}var Ie=me('<p>No story rendered. See <a href="https://github.com/storybookjs/addon-svelte-csf#defining-stories" target="_blank">the docs</a> on how to define stories.</p>');function Z(t,e){I(e,!0);const r=ye(e,["$$slots","$$events","$$legacy","children","name","exportName","play"]),s=e.exportName??K(e.name),n=Re(),i=W(),c=De(),a=de(()=>!n.isExtracting&&i.currentStoryExportName===s);n.isExtracting&&n.register({children:e.children,name:e.name,exportName:s,play:e.play,...r});function o(l,g){g&&l.playFunction&&(l.playFunction.__play=g)}U(()=>{C(a)&&o(i.storyContext,e.play)});var u=m(),f=p(u);{var x=l=>{var g=m(),R=p(g);{var w=_=>{var O=m(),P=p(O);ve(P,()=>e.children,()=>i.args,()=>i.storyContext),y(_,O)},V=_=>{var O=m(),P=p(O);{var $=v=>{c(v,()=>i.args,()=>i.storyContext)},ee=v=>{var Y=m(),te=p(Y);{var re=b=>{var N=m(),se=p(N);q(se,()=>i.storyContext.component,(ae,ie)=>{ie(ae,ge(()=>i.args))}),y(b,N)},ne=b=>{var N=Ie();y(b,N)};A(te,b=>{i.storyContext.component?b(re):b(ne,!1)},!0)}y(v,Y)};A(P,v=>{c?v($):v(ee,!1)},!0)}y(_,O)};A(R,_=>{e.children?_(w):_(V,!1)})}y(l,g)};A(f,l=>{C(a)&&l(x)})}y(t,u),M()}Z.__docgen={data:[],name:"Story.svelte"};function et(t){return{Story:Z,meta:t}}function J(t,e){I(e,!0),Fe(e.repository());var r=m(),s=p(r);q(s,()=>e.Stories,(n,i)=>{i(n,{})}),y(t,r),M()}J.__docgen={data:[{name:"Stories",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"any",text:"any"},static:!1,readonly:!1},{name:"repository",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"function",text:"() => StoriesRepository<Cmp>"},static:!1,readonly:!1}],name:"StoriesExtractor.svelte"};function Me(t){switch(typeof t){case"number":case"symbol":return!1;case"string":return t.includes(".")||t.includes("[")||t.includes("]")}}function qe(t){return Object.is(t,-0)?"-0":t.toString()}function Ye(t){const e=[],r=t.length;if(r===0)return e;let s=0,n="",i="",c=!1;for(t.charCodeAt(0)===46&&(e.push(""),s++);s<r;){const a=t[s];i?a==="\\"&&s+1<r?(s++,n+=t[s]):a===i?i="":n+=a:c?a==='"'||a==="'"?i=a:a==="]"?(c=!1,e.push(n),n=""):n+=a:a==="["?(c=!0,n&&(e.push(n),n="")):a==="."?n&&(e.push(n),n=""):n+=a,s++}return n&&e.push(n),e}function z(t,e,r){if(t==null)return r;switch(typeof e){case"string":{const s=t[e];return s===void 0?Me(e)?z(t,Ye(e),r):r:s}case"number":case"symbol":{typeof e=="number"&&(e=qe(e));const s=t[e];return s===void 0?r:s}default:{if(Array.isArray(e))return Be(t,e,r);Object.is(e==null?void 0:e.valueOf(),-0)?e="-0":e=String(e);const s=t[e];return s===void 0?r:s}}}function Be(t,e,r){if(e.length===0)return r;let s=t;for(let n=0;n<e.length;n++){if(s==null)return r;s=s[e[n]]}return s===void 0?r:s}const{addons:Le}=__STORYBOOK_MODULE_PREVIEW_API__,Ke=Le.getChannel(),Xe=t=>{const{storyContext:e}=t;if(We(e))return;const r=Ge({code:e.parameters.__svelteCsf.rawCode,args:t.args});setTimeout(()=>{Ke.emit(_e,{id:e.id,args:e.unmappedArgs,source:r})})},We=t=>{var n;const e=(n=t==null?void 0:t.parameters.docs)==null?void 0:n.source,r=t==null?void 0:t.parameters.__isArgsStory;return(t==null?void 0:t.parameters.__svelteCsf.rawCode)?(e==null?void 0:e.type)===B.DYNAMIC?!1:!r||(e==null?void 0:e.code)||(e==null?void 0:e.type)===B.CODE:!0},Ge=({code:t,args:e})=>{const r=Object.entries(e??{}).map(([i,c])=>Je(i,c)).filter(i=>i);let s=r.join(" ");return s.length>50&&(s=`
  ${r.join(`
  `)}
`),t.replaceAll("{...args}",s).replace(/args(?:[\w\d_$\.\?\[\]"'])+/g,i=>{const c=i.replaceAll("?",""),a=z({args:e},c);return H(a)})},Ze=t=>{var r;const e=((r=t.getMockName)==null?void 0:r.call(t))??t.name;return e&&e!=="spy"?e:"() => {}"},H=t=>{var e;return typeof t=="object"&&t[Symbol.for("svelte.snippet")]?"snippet":typeof t=="function"?Ze(t):(e=JSON.stringify(t,null,1))==null?void 0:e.replace(/\n/g,"").replace(new RegExp("(?<!\\s)([}\\]])$")," $1")},Je=(t,e)=>{if(e==null)return null;if(e===!0)return t;const r=H(e);return typeof e=="string"?`${t}=${r}`:`${t}={${r}}`};function Q(t,e){I(e,!0);const r=W();U(()=>{r.set({currentStoryExportName:e.exportName,args:e.args,storyContext:e.storyContext})}),U(()=>{Xe({args:e.args,storyContext:e.storyContext})});var s=m(),n=p(s);q(n,()=>e.Stories,(i,c)=>{c(i,{})}),y(t,s),M()}Q.__docgen={data:[{name:"Stories",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"any",text:"any"},static:!1,readonly:!1},{name:"exportName",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"string",text:"string"},static:!1,readonly:!1},{name:"args",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"any",text:"any"},static:!1,readonly:!1},{name:"storyContext",visibility:"public",keywords:[{name:"required",description:""}],kind:"let",type:{kind:"type",type:"any",text:"any"},static:!1,readonly:!1}],name:"StoryRenderer.svelte"};const{logger:ze}=__STORYBOOK_MODULE_CLIENT_LOGGER__,He=document.createDocumentFragment?()=>document.createDocumentFragment():()=>document.createElement("div"),tt=(t,e)=>{const r={stories:new Map};try{const n=pe(J,{target:He(),props:{Stories:t,repository:()=>r}});xe(n)}catch(n){ze.error(`Error in mounting stories ${n.toString()}`,n)}const s={};for(const[n,i]of r.stories){const c={...i,render:(o,u)=>({Component:Q,props:{exportName:n,Stories:t,storyContext:u,args:o}})},a=e.play??i.play;a&&(c.play=o=>{var f;const u=(f=o.playFunction)==null?void 0:f.__play;return u?u(o):a(o)}),s[n]=c}return s};export{ve as a,tt as c,et as d,$e as s};
