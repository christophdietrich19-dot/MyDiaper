(function(root){
  'use strict';
  const app=root.MyDiaper=root.MyDiaper||{};

  function createToaster(container,options={}){
    const duration=Number.isFinite(options.duration)?options.duration:2600;
    const limit=Number.isInteger(options.limit)&&options.limit>0?options.limit:3;
    const schedule=options.setTimeout||root.setTimeout||(()=>null);
    const cancel=options.clearTimeout||root.clearTimeout||(()=>{});
    const active=new Map(),order=[];

    function dismiss(key){
      const item=active.get(key);
      if(!item)return false;
      cancel(item.timer);
      item.node.remove?.();
      active.delete(key);
      const index=order.indexOf(key);
      if(index>=0)order.splice(index,1);
      return true;
    }
    function arm(key,item){
      cancel(item.timer);
      item.timer=schedule(()=>dismiss(key),duration);
    }
    function show(message,type='status'){
      const text=String(message||'').trim();
      if(!text||!container)return null;
      const key=`${type}:${text}`;
      const existing=active.get(key);
      if(existing){
        existing.node.dataset.repeated=String((Number(existing.node.dataset.repeated)||0)+1);
        arm(key,existing);
        return existing.node;
      }
      const documentRef=container.ownerDocument||root.document;
      if(!documentRef?.createElement)return null;
      const node=documentRef.createElement('div');
      node.className=`toast toast-${type}`;
      node.textContent=text;
      node.role=type==='error'?'alert':'status';
      node.dataset.toastKey=key;
      node.dataset.repeated='0';
      container.appendChild(node);
      const item={node,timer:null};
      active.set(key,item);
      order.push(key);
      arm(key,item);
      while(order.length>limit)dismiss(order[0]);
      return node;
    }
    function clear(){for(const key of [...order])dismiss(key);}
    return {show,dismiss,clear,count:()=>active.size};
  }

  function createPageLock(documentRef=root.document,view=root,background=null){
    let locked=false,scrollY=0,saved=null;
    const properties=['position','top','left','right','width','overflow'];
    const capture=element=>element?.style?Object.fromEntries(properties.map(name=>[name,element.style[name]||''])):null;
    const restore=(element,state)=>{if(element?.style&&state)for(const name of properties)element.style[name]=state[name];};
    function lock(){
      if(locked)return;
      const html=documentRef?.documentElement,body=documentRef?.body;
      scrollY=Number(view?.scrollY)||0;
      saved={
        html:capture(html),
        body:capture(body),
        background:background?{
          inert:Boolean(background.hasAttribute?.('inert')),
          ariaHidden:background.getAttribute?.('aria-hidden')??null
        }:null
      };
      html?.classList?.add('modal-open');
      body?.classList?.add('modal-open');
      background?.setAttribute?.('inert','');
      background?.setAttribute?.('aria-hidden','true');
      if(html?.style)html.style.overflow='hidden';
      if(body?.style){
        body.style.position='fixed';body.style.top=`-${scrollY}px`;body.style.left='0';body.style.right='0';body.style.width='100%';body.style.overflow='hidden';
      }
      locked=true;
    }
    function unlock(){
      if(!locked)return;
      const html=documentRef?.documentElement,body=documentRef?.body;
      html?.classList?.remove('modal-open');
      body?.classList?.remove('modal-open');
      restore(html,saved?.html);restore(body,saved?.body);
      if(background){
        if(saved?.background?.inert)background.setAttribute?.('inert','');
        else background.removeAttribute?.('inert');
        if(saved?.background?.ariaHidden===null)background.removeAttribute?.('aria-hidden');
        else background.setAttribute?.('aria-hidden',saved.background.ariaHidden);
      }
      locked=false;saved=null;
      if(typeof view?.scrollTo==='function')view.scrollTo({top:scrollY,left:0,behavior:'instant'});
    }
    return {lock,unlock,isLocked:()=>locked,scrollPosition:()=>scrollY};
  }

  app.feedback={createToaster,createPageLock};
  if(typeof module!=='undefined'&&module.exports)module.exports=app.feedback;
})(globalThis);
