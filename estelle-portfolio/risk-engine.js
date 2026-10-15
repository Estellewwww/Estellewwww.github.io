/* Independent educational prototype. Synthetic data only; no employer methodology. */
(function(root){
 'use strict';
 function random(seed){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return(seed+.5)/4294967296;};}
 function normal(r){return Math.sqrt(-2*Math.log(r()))*Math.cos(2*Math.PI*r());}
 const types=[{name:'Compact · ICE',price:28000,dep:.14},{name:'SUV · ICE',price:42000,dep:.12},{name:'Battery electric',price:48000,dep:.20}];
 function quantile(sorted,p){const t=(sorted.length-1)*p,l=Math.floor(t);return sorted[l]+(sorted[Math.ceil(t)]-sorted[l])*(t-l);}
 function simulate(o){
  const N=600,S=400,r=random(81735),cars=[],segments=types.map(t=>({name:t.name,count:0,guaranteed:0,loss:0}));let initial=0;
  for(let i=0;i<N;i++){
   const u=i/N,k=u<o.evShare?2:((u-o.evShare)/(1-o.evShare||1)<.5?0:1),t=types[k];
   const price=t.price*(.9+.2*r()),forecast=price*Math.pow(1-t.dep,o.term/12),guarantee=.95*forecast;
   cars.push({k,forecast,guarantee});initial+=price;segments[k].count++;segments[k].guaranteed+=guarantee;
  }
  const totals=[];
  for(let j=0;j<S;j++){
   const shared=normal(r);let total=0;
   for(const c of cars){
    const resale=Math.max(0,c.forecast*(1+o.shock+(c.k===2?o.evShock:0)+o.error*(Math.sqrt(.4)*shared+Math.sqrt(.6)*normal(r))));
    const loss=Math.max(0,c.guarantee-resale);total+=loss;segments[c.k].loss+=loss/S;
   }totals.push(total);
  }
  const sorted=totals.slice().sort((a,b)=>a-b),expected=totals.reduce((a,b)=>a+b,0)/S,premium=initial*o.premium,expense=initial*.01;
  return{initial,expected,p95:quantile(sorted,.95),premium,expense,margin:premium-expected-expense,lossRatio:expected/premium,segments,totals,draws:S,count:N};
 }
 const api={simulate,quantile};root.RiskEngine=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
