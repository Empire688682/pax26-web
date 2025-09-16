"use client"
import React from 'react'
import { useGlobalContext } from '../Context';

const CashBackOption = ({ userCashBack, setChecked, checked }) => {
    const {pax26} = useGlobalContext();

    if(userCashBack < 1){
        return ;
    }
    
    return (
        <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
                <h1
                style={{color:pax26.textPrimary}}>Use Cashback</h1>
                <input
                    type="checkbox"
                    name=""
                    checked={checked}
                    onChange={() => setChecked(!checked)} />
            </div>
            <p className='text-green-500 font-bold'>₦ {userCashBack}</p>
        </div>
    )
}

export default CashBackOption
