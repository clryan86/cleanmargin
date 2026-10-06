"use client";
import {useEffect,useId,useRef,type ReactNode} from "react";
import {X} from "lucide-react";
export default function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);const titleId=useId();
 useEffect(()=>{const d=ref.current;d?.showModal();return()=>{d?.close();};},[]);
 return <dialog ref={ref} className="modal" aria-labelledby={titleId} onCancel={onClose}><div className="modal-heading"><h2 id={titleId}>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={21}/></button></div><div className="modal-body">{children}</div></dialog>;
}
