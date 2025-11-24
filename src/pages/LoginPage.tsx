import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { Tariff, useStore } from '../state/store'

export default function LoginPage() {
  const nav = useNavigate()
  const { login } = useStore()
  const [email, setEmail] = useState('demo@company.com')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<1|2|3>(1)
  const [tariff, setTariff] = useState<Tariff>('FREE')

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card w-full max-w-md p-6">
        <SectionHeader title="Login" subtitle="B2B Online Booking Tool (prototype)" />

        {step === 1 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Work email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
            <button className="btn-primary w-full" onClick={()=>setStep(2)}>Send code</button>
            <p className="text-xs text-slate-500">For demo you can enter any email.</p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Code from email</label>
            <input className="input" placeholder="1234" value={code} onChange={e=>setCode(e.target.value)} />
            <button className="btn-primary w-full" onClick={()=>setStep(3)}>Continue</button>
            <button className="btn-ghost w-full" onClick={()=>setStep(1)}>Back</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Choose tariff for demo</label>
            <select className="select" value={tariff} onChange={e=>setTariff(e.target.value as Tariff)}>
              <option value="FREE">Free</option>
              <option value="POSTPAY">Postpay</option>
              <option value="FLEX">Flex / VIP</option>
            </select>
            <button className="btn-primary w-full" onClick={() => { login(email, tariff); nav('/dashboard') }}>Enter</button>
          </div>
        )}
      </div>
    </div>
  )
}
