"use client";
import { useEffect, useState } from 'react';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import * as fb from '../../firebase';

export default function Migrate() {
  const [status, setStatus] = useState("Waiting...");

  useEffect(() => {
    async function run() {
      setStatus("Running...");
      try {
        const db = fb.db;
        const snapshot = await getDocs(collection(db, 'wholesellers'));
        const batch = writeBatch(db);
        let count = 0;
        
        snapshot.forEach(d => {
          const data = d.data();
          const name = (data.companyName || data.name || "").toLowerCase();
          const isLotus = name.includes("lotus land");
          batch.update(d.ref, {
            statusB2B: 'active',
            statusB2C: isLotus ? 'active' : 'inactive'
          });
          count++;
        });
        
        await batch.commit();
        setStatus(`Done! Migrated ${count} suppliers.`);
      } catch (e) {
        setStatus(`Error: ${e.message}`);
      }
    }
    run();
  }, []);

  return <div>{status}</div>;
}
