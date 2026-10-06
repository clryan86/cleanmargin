import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import Dashboard from "./dashboard";
function App(){const [signedIn,setSignedIn]=useState(false);useEffect(()=>{fetch("/api/me").then(r=>r.json()).then(x=>setSignedIn(!!x.signedIn)).catch(()=>{});},[]);return <Dashboard signedIn={signedIn}/>;}
createRoot(document.getElementById("root")!).render(<App/>);
