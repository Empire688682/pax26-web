'use client'

import React, { useState } from 'react'
import { useGlobalContext } from '../Context';

const TransactionPin = () => {
  const {setPinModal, setUserData} = useGlobalContext()
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if(pin === "1234"){
      setMessage({ type: 'error', text: '1234 is not allowed.' });
      return;
    }

    try {
      const res = await fetch('/api/provider/set-transaction-pin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin }),
      })

      const data = await res.json()

      console.log(data);

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });

         if (typeof window !== "undefined") {
                  const savedData = localStorage.getItem("userData");
        
                  if (!savedData) {
                    toast.error("An error occured try again");
                    return
                  }
                  const parseData = JSON.parse(savedData);
                  parseData.pin = pin;
                  localStorage.setItem("userData", JSON.stringify(parseData));
                  setUserData(parseData);
                }
                setPinModal(false);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-xl rounded-xl">
      <h2 className="text-1xl font-bold mb-4 text-center">Set Your Transaction PIN</h2>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="password"
          maxLength={4}
          inputMode="numeric"
          pattern="\d{4}"
          required
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter 4-digit PIN"
          className="border rounded-lg p-2 text-center text-base md:text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          {loading ? 'Saving...' : 'Save PIN'}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              message.type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message.text}
          </p>
        )}
      </form>
    </div>
  )
}

export default TransactionPin
