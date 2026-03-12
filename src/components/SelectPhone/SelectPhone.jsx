"use client"
import React, { Suspense } from 'react'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import SelectPhoneWrapper from '../Wrappers/SelectPhoneWrapper'

const SelectPhone = () => {
  return (
    <div>
      <Suspense fallback={<div><LoadingSpinner /></div>}>
      <SelectPhoneWrapper/>
      </Suspense>
    </div>
  )
}

export default SelectPhone
