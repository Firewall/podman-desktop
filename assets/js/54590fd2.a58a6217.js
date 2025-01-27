"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[84874],{99050:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>c,contentTitle:()=>d,default:()=>p,frontMatter:()=>r,metadata:()=>o,toc:()=>a});const o=JSON.parse('{"id":"kubernetes/deploying-a-pod-to-kubernetes","title":"Deploying a pod or container","description":"Deploying a pod or container to Kubernetes","source":"@site/docs/kubernetes/deploying-a-pod-to-kubernetes.md","sourceDirName":"kubernetes","slug":"/kubernetes/deploying-a-pod-to-kubernetes","permalink":"/docs/kubernetes/deploying-a-pod-to-kubernetes","draft":false,"unlisted":false,"editUrl":"https://github.com/podman-desktop/podman-desktop/tree/main/website/docs/kubernetes/deploying-a-pod-to-kubernetes.md","tags":[{"inline":true,"label":"migrating-to-kubernetes","permalink":"/docs/tags/migrating-to-kubernetes"},{"inline":true,"label":"deploying-a-pod","permalink":"/docs/tags/deploying-a-pod"},{"inline":true,"label":"deploying-a-container","permalink":"/docs/tags/deploying-a-container"}],"version":"current","sidebarPosition":10,"frontMatter":{"sidebar_position":10,"title":"Deploying a pod or container","description":"Deploying a pod or container to Kubernetes","keywords":["podman desktop","podman","containers","pods","migrating","kubernetes"],"tags":["migrating-to-kubernetes","deploying-a-pod","deploying-a-container"]},"sidebar":"mySidebar","previous":{"title":"Selecting a context","permalink":"/docs/kubernetes/viewing-and-selecting-current-kubernetes-context"},"next":{"title":"Creating a Kubernetes cluster","permalink":"/docs/kubernetes/creating-a-kube-cluster"}}');var s=t(62540),i=t(43023);const r={sidebar_position:10,title:"Deploying a pod or container",description:"Deploying a pod or container to Kubernetes",keywords:["podman desktop","podman","containers","pods","migrating","kubernetes"],tags:["migrating-to-kubernetes","deploying-a-pod","deploying-a-container"]},d="Deploying a pod or container to Kubernetes",c={},a=[{value:"Prerequisites",id:"prerequisites",level:4},{value:"Procedure",id:"procedure",level:4},{value:"Verification",id:"verification",level:4}];function l(e){const n={a:"a",admonition:"admonition",code:"code",em:"em",h1:"h1",h4:"h4",header:"header",img:"img",li:"li",ol:"ol",p:"p",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(n.header,{children:(0,s.jsx)(n.h1,{id:"deploying-a-pod-or-container-to-kubernetes",children:"Deploying a pod or container to Kubernetes"})}),"\n",(0,s.jsx)(n.p,{children:"With Podman Desktop, you can deploy a pod to your Kubernetes cluster with an active connection. Any container that is part of a pod is also deployable to your cluster."}),"\n",(0,s.jsx)(n.h4,{id:"prerequisites",children:"Prerequisites"}),"\n",(0,s.jsxs)(n.ul,{children:["\n",(0,s.jsx)(n.li,{children:"Your are using the Podman container engine."}),"\n",(0,s.jsxs)(n.li,{children:["Your pod, running or stopped, is available on the ",(0,s.jsx)(n.strong,{children:"Pods"})," page: ",(0,s.jsx)(n.em,{children:"<your_pod>"}),"."]}),"\n",(0,s.jsxs)(n.li,{children:["You registered the Kubernetes cluster in your kubeconfig file: ",(0,s.jsx)(n.em,{children:"<your_kubernetes_cluster>"}),". For example, ",(0,s.jsx)(n.a,{href:"/docs/kind/creating-a-kind-cluster",children:"Creating a kind cluster"}),"."]}),"\n",(0,s.jsx)(n.li,{children:"The Kubernetes namespace to deploy to already exists."}),"\n",(0,s.jsx)(n.li,{children:"Your container has a port that is exposed correctly to generate a service."}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"procedure",children:"Procedure"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Select your ",(0,s.jsx)(n.a,{href:"/docs/kubernetes/viewing-and-selecting-current-kubernetes-context",children:"Kubernetes context"}),"."]}),"\n",(0,s.jsx)(n.admonition,{type:"note",children:(0,s.jsxs)(n.p,{children:["Your pod or container is deployed to the ",(0,s.jsx)(n.code,{children:"default"})," namespace of the Kubernetes cluster. To switch to a different namespace, use this command: ",(0,s.jsx)(n.code,{children:"kubectl config set-context --current --namespace=<name-of-the-namespace>"}),"."]})}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Go to the ",(0,s.jsx)(n.strong,{children:"Pods"})," or ",(0,s.jsx)(n.strong,{children:"Containers"})," component page."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Click the overflow menu icon corresponding to the pod or container.\n",(0,s.jsx)(n.img,{alt:"overflow menu icon",src:t(81451).A+"",width:"1574",height:"638"})]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Select the ",(0,s.jsx)(n.strong,{children:"Deploy to Kubernetes"})," option from the dropdown list."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Select the checkbox to expose the service locally by using the default ingress controller.\n",(0,s.jsx)(n.img,{alt:"expose the service locally",src:t(41032).A+"",width:"1566",height:"1192"})]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Conditional: When you configure custom port mapping while running an image, you have the option to select an Ingress host port from the dropdown list.\n",(0,s.jsx)(n.img,{alt:"ingress-host-port",src:t(75135).A+"",width:"1604",height:"180"}),"\nOtherwise, you do not see the option."]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Click ",(0,s.jsx)(n.strong,{children:"Deploy"})," and then ",(0,s.jsx)(n.strong,{children:"Done"}),"."]}),"\n"]}),"\n"]}),"\n",(0,s.jsx)(n.h4,{id:"verification",children:"Verification"}),"\n",(0,s.jsxs)(n.ol,{children:["\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["On the ",(0,s.jsx)(n.strong,{children:"Deploy generated pod to Kubernetes"})," screen, the created pod status is ",(0,s.jsx)(n.em,{children:"Phase: Running"}),"\n",(0,s.jsx)(n.img,{alt:"Deploying a pod",src:t(97160).A+"",width:"1554",height:"1180"})]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Go to ",(0,s.jsx)(n.strong,{children:"Pods"}),": your Kubernetes pod is in the list.\n",(0,s.jsx)(n.img,{alt:"kube pod in the list",src:t(49813).A+"",width:"1756",height:"528"})]}),"\n"]}),"\n",(0,s.jsxs)(n.li,{children:["\n",(0,s.jsxs)(n.p,{children:["Optional: Check the running service on the ",(0,s.jsx)(n.strong,{children:"Kubernetes > Services"})," page.\n",(0,s.jsx)(n.img,{alt:"running service",src:t(16600).A+"",width:"1684",height:"460"})]}),"\n"]}),"\n"]})]})}function p(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(l,{...e})}):l(e)}},97160:(e,n,t)=>{t.d(n,{A:()=>o});const o=t.p+"assets/images/deploying-a-pod-7dc0d90b7d92376f4fb784e3a2601b98.png"},41032:(e,n,t)=>{t.d(n,{A:()=>o});const o=t.p+"assets/images/expose-the-service-locally-c0f9ff42272180112432dd0dc98eda5e.png"},75135:(e,n,t)=>{t.d(n,{A:()=>o});const o=t.p+"assets/images/ingress-host-port-add5711cd5105afc5d53138e02d0a380.png"},49813:(e,n,t)=>{t.d(n,{A:()=>o});const o=t.p+"assets/images/kube-pod-in-the-list-4ba13dcb68385e77a9bdf194faf853bb.png"},81451:(e,n,t)=>{t.d(n,{A:()=>o});const o=t.p+"assets/images/overflow-menu-icon-d4b2789f34e65233c6e3df4e59b5a127.png"},16600:(e,n,t)=>{t.d(n,{A:()=>o});const o=t.p+"assets/images/running-service-bdb72b8bff7776b9817492585cd8b861.png"},43023:(e,n,t)=>{t.d(n,{R:()=>r,x:()=>d});var o=t(63696);const s={},i=o.createContext(s);function r(e){const n=o.useContext(i);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function d(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),o.createElement(i.Provider,{value:n},e.children)}}}]);