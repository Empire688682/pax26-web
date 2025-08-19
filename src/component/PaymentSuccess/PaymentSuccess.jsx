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
      <div className="bg-white p-6 rounded-2xl shadow-md flex gap-4 flex-col text-center max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800">{status}</h2>
        {loading && (
          <div className="flex justify-center items-center mt-4">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Verifying...</span>
          </div>
        )}
        {
          loading ?
            <p>Please wait while we verify your payment</p>
            :
            <p>Verification process complete</p>
        }
        <p className="text-gray-500 text-sm">Transaction ID: <span className='font-semibold'>{transaction_id}</span></p>
      </div>
      <button onClick={() => route.push("/dashboard")} className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition'>To Dashboard</button>
    </div>
  );
}
