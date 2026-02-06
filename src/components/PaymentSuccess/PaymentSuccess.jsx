'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGlobalContext } from '../Context';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const transaction_id = searchParams.get('tx_ref');
  const transactionStatus = searchParams.get('status');
  const [status, setStatus] = useState('Verifying payment...');
  const { route } = useGlobalContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transaction_id && transactionStatus) {
      if(transactionStatus === "cancelled"){
        setStatus("❌ Verification failed");
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction_id }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.success) {
            setStatus("❌ " + data.message);
          }
          if (data.success) {
            setStatus("✅ " + data.message);
          }
        })
        .catch(() => setStatus('❌ Error verifying payment'))
        .finally(() => {
          setLoading(false);
        });
    }
  }, [transaction_id]);

  return (
    <div className="flex items-center justify-center gap-6 flex-col">
      
    </div>
  );
}
