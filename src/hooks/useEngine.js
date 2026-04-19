import { useState, useEffect, useRef } from 'react';
import { GridCombatManager } from '../engine/GridCombatManager';

export function useEngine() {
   const engineRef = useRef(null);
   const [state, setState] = useState(null);

   useEffect(() => {
       if (!engineRef.current) {
           engineRef.current = new GridCombatManager();
           engineRef.current.subscribe(setState);
           engineRef.current.notifyUpdate(); // initial state grab
       }
   }, []);

   return { engine: engineRef.current, state };
}
