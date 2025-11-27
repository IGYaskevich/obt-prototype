import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from '../components/SectionHeader'
import { useStore, Tariff } from '../state/store'
import { Building2, User, Mail, CreditCard, ArrowRight, ArrowLeft, CheckCircle2, Info } from 'lucide-react'

type Step = 1 | 2 | 3

export default function CompanySignupPage() {
   const nav = useNavigate()
   const { login } = useStore()

   const [step, setStep] = useState<Step>(1)

   /** STEP 1: company + admin */
   const [companyName, setCompanyName] = useState('Demo Company LLC')
   const [companyBin, setCompanyBin] = useState('123456789012')
   const [companySize, setCompanySize] = useState<'SMALL' | 'MID' | 'ENTERPRISE'>('SMALL')
   const [adminName, setAdminName] = useState('Ignat Admin')
   const [adminEmail, setAdminEmail] = useState('admin@company.com')
   const [adminPhone, setAdminPhone] = useState('+7 700 000 00 00')

   /** STEP 2: tariff + basic billing expectations */
   const [tariff, setTariff] = useState<Tariff>('FREE')
   const [expectedMonthlySpend, setExpectedMonthlySpend] = useState<number>(500000)
   const [preferredDueDays, setPreferredDueDays] = useState<number>(14)

   /** STEP 3: payment + card link (for paid tariffs) */
   const [cardHolder, setCardHolder] = useState('Ignat Admin')
   const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111')
   const [cardExpiry, setCardExpiry] = useState('12/28')
   const [cardCvv, setCardCvv] = useState('123')
   const [agreeTerms, setAgreeTerms] = useState(true)

   const [isSubmitting, setIsSubmitting] = useState(false)
   const [done, setDone] = useState(false)

   const isFree = tariff === 'FREE'
   const isPostpay = tariff === 'POSTPAY'
   const isFlex = tariff === 'FLEX'

   /** валидация */
   const canGoStep1Next = useMemo(() => companyName.trim().length > 1 && companyBin.trim().length >= 6 && adminEmail.trim().length > 3, [companyName, companyBin, adminEmail])

   const canSubmitPaid = useMemo(
      () => !isFree && cardHolder.trim().length > 1 && cardNumber.replace(/\s/g, '').length >= 12 && cardExpiry.trim().length >= 4 && cardCvv.trim().length >= 3 && agreeTerms,
      [isFree, cardHolder, cardNumber, cardExpiry, cardCvv, agreeTerms],
   )

   const handleNext = () => {
      if (step === 1 && canGoStep1Next) {
         setStep(2)
         return
      }

      if (step === 2) {
         if (isFree) {
            handleComplete()
         } else {
            setStep(3)
         }
      }
   }

   const handleBack = () => {
      if (step === 1 || isSubmitting) return
      if (step === 3) setStep(2)
      else setStep(1)
   }

   const targetAfterSignup = isFree ? '/search' : '/dashboard'

   const handleComplete = () => {
      if (!adminEmail.trim()) return

      setIsSubmitting(true)

      // имитация: регистрация компании + (для платных тарифов) привязка карты
      setTimeout(
         () => {
            /**
             * В реальном продукте:
             *  - здесь бы отправляли все данные (companyName, BIN, expectedSpend и т.п.) в backend
             *  - backend создавал бы компанию, пользователя ADMIN и токенизировал карту
             *
             * В прототипе: просто логинимся с выбранным тарифом.
             */
            login(adminEmail, tariff)

            setDone(true)
            setIsSubmitting(false)

            // мягкий редирект
            setTimeout(() => {
               nav(targetAfterSignup)
            }, 900)
         },
         isFree ? 700 : 1400,
      )
   }

   const handleSubmitPaid = () => {
      if (!canSubmitPaid) return
      handleComplete()
   }

   /** правый сайдбар – резюме */
   const Summary = (
      <div className="hidden lg:block lg:w-72">
         <div className="card p-4 text-xs space-y-3">
            <div className="flex items-center gap-2">
               <Info size={14} className="text-slate-500" />
               <span className="font-semibold text-sm">Sign-up summary</span>
            </div>
            <div className="space-y-2">
               <div>
                  <div className="text-[11px] text-slate-500">Company</div>
                  <div className="text-[12px] font-medium text-slate-800">{companyName || '—'}</div>
                  <div className="text-[11px] text-slate-500">BIN / Tax ID: {companyBin || '—'}</div>
               </div>
               <div>
                  <div className="text-[11px] text-slate-500">Admin</div>
                  <div className="text-[12px] font-medium text-slate-800">{adminName || '—'}</div>
                  <div className="text-[11px] text-slate-500">{adminEmail || '—'}</div>
               </div>
               <div>
                  <div className="text-[11px] text-slate-500">Tariff</div>
                  <div className="text-[12px] font-medium text-slate-800">
                     {tariff} {isFree ? '(Free fast start)' : isPostpay ? '(Postpay)' : '(Flex / VIP)'}
                  </div>
                  {!isFree && (
                     <div className="text-[11px] text-slate-500">
                        Expected monthly spend: ~{expectedMonthlySpend.toLocaleString()} ₸ · Due date: {preferredDueDays} days
                     </div>
                  )}
               </div>
               {!isFree && (
                  <div>
                     <div className="text-[11px] text-slate-500">Corporate card</div>
                     <div className="text-[12px] text-slate-800">{cardHolder || '—'}</div>
                     <div className="text-[11px] text-slate-500">{cardNumber ? `**** **** **** ${cardNumber.slice(-4)}` : '—'}</div>
                  </div>
               )}
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
               After sign-up you&apos;ll be redirected to {isFree ? 'Search (first ticket fast flow).' : 'Dashboard to manage trips and company.'}
            </div>
         </div>
      </div>
   )

   return (
      <div className="space-y-6">
         <SectionHeader title="Register your company" subtitle="Create a company admin account, choose tariff and (if needed) link a corporate card." />

         {/* Steps indicator */}
         <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
            <StepDot active={step >= 1} label="Company & admin" index={1} />
            <ArrowRight size={14} className="text-slate-400" />
            <StepDot active={step >= 2} label="Tariff & billing" index={2} />
            <ArrowRight size={14} className="text-slate-400" />
            <StepDot active={step >= 3 || isFree} label={isFree ? 'Confirm' : 'Payment & card'} index={3} />
         </div>

         {/* Main layout: form + summary */}
         <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
               <div className="card p-5 space-y-5 text-sm">
                  {step === 1 && (
                     <Step1CompanyAdmin
                        companyName={companyName}
                        setCompanyName={setCompanyName}
                        companyBin={companyBin}
                        setCompanyBin={setCompanyBin}
                        companySize={companySize}
                        setCompanySize={setCompanySize}
                        adminName={adminName}
                        setAdminName={setAdminName}
                        adminEmail={adminEmail}
                        setAdminEmail={setAdminEmail}
                        adminPhone={adminPhone}
                        setAdminPhone={setAdminPhone}
                     />
                  )}

                  {step === 2 && (
                     <Step2TariffBilling
                        tariff={tariff}
                        setTariff={setTariff}
                        expectedMonthlySpend={expectedMonthlySpend}
                        setExpectedMonthlySpend={setExpectedMonthlySpend}
                        preferredDueDays={preferredDueDays}
                        setPreferredDueDays={setPreferredDueDays}
                     />
                  )}

                  {step === 3 && !isFree && (
                     <Step3Payment
                        cardHolder={cardHolder}
                        setCardHolder={setCardHolder}
                        cardNumber={cardNumber}
                        setCardNumber={setCardNumber}
                        cardExpiry={cardExpiry}
                        setCardExpiry={setCardExpiry}
                        cardCvv={cardCvv}
                        setCardCvv={setCardCvv}
                        agreeTerms={agreeTerms}
                        setAgreeTerms={setAgreeTerms}
                        isPostpay={isPostpay}
                        isFlex={isFlex}
                     />
                  )}

                  {/* Footer buttons */}
                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                     <button className="btn-ghost flex items-center gap-1 text-xs text-slate-600 disabled:opacity-40" onClick={handleBack} disabled={step === 1 || isSubmitting}>
                        <ArrowLeft size={14} />
                        Back
                     </button>

                     <div className="flex items-center gap-2">
                        {done && (
                           <div className="flex items-center gap-1 text-emerald-600 text-xs">
                              <CheckCircle2 size={14} />
                              <span>Company created, redirecting…</span>
                           </div>
                        )}

                        {!done && (
                           <>
                              {step === 1 && (
                                 <button
                                    className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60"
                                    onClick={handleNext}
                                    disabled={!canGoStep1Next || isSubmitting}
                                 >
                                    Next
                                    <ArrowRight size={14} />
                                 </button>
                              )}

                              {step === 2 && isFree && (
                                 <button className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60" onClick={handleComplete} disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating…' : 'Create & go to booking'}
                                    {!isSubmitting && <ArrowRight size={14} />}
                                 </button>
                              )}

                              {step === 2 && !isFree && (
                                 <button className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60" onClick={handleNext} disabled={isSubmitting}>
                                    Continue to payment
                                    <ArrowRight size={14} />
                                 </button>
                              )}

                              {step === 3 && !isFree && (
                                 <button
                                    className="btn-primary flex items-center gap-1 text-xs disabled:opacity-60"
                                    onClick={handleSubmitPaid}
                                    disabled={!canSubmitPaid || isSubmitting}
                                 >
                                    {isSubmitting ? 'Processing…' : 'Pay & link corporate card'}
                                 </button>
                              )}
                           </>
                        )}
                     </div>
                  </div>
               </div>

               <div className="mt-2 text-[11px] text-slate-500">
                  Prototype note: no real payments are made, card data is not sent anywhere. The flow mirrors how real sign-up + card linking would look.
               </div>
            </div>

            {Summary}
         </div>
      </div>
   )
}

/* ---------- small components ---------- */

function StepDot({ active, label, index }: { active: boolean; label: string; index: number }) {
   return (
      <div className="flex items-center gap-2">
         <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
               active ? 'bg-brand-50 border-brand-500 text-brand-700' : 'bg-slate-100 border-slate-300 text-slate-400'
            }`}
         >
            {index}
         </div>
         <span className="text-[11px] text-slate-600">{label}</span>
      </div>
   )
}

type Step1Props = {
   companyName: string
   setCompanyName: (v: string) => void
   companyBin: string
   setCompanyBin: (v: string) => void
   companySize: 'SMALL' | 'MID' | 'ENTERPRISE'
   setCompanySize: (v: 'SMALL' | 'MID' | 'ENTERPRISE') => void
   adminName: string
   setAdminName: (v: string) => void
   adminEmail: string
   setAdminEmail: (v: string) => void
   adminPhone: string
   setAdminPhone: (v: string) => void
}

function Step1CompanyAdmin({
   companyName,
   setCompanyName,
   companyBin,
   setCompanyBin,
   companySize,
   setCompanySize,
   adminName,
   setAdminName,
   adminEmail,
   setAdminEmail,
   adminPhone,
   setAdminPhone,
}: Step1Props) {
   return (
      <div className="grid md:grid-cols-2 gap-5 text-xs">
         <div className="space-y-3">
            <div className="flex items-center gap-2">
               <Building2 size={16} className="text-slate-600" />
               <span className="font-semibold text-sm">Company details</span>
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Company name</label>
               <input className="input mt-1 text-xs" value={companyName} onChange={e => setCompanyName(e.target.value)} />
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Tax ID / BIN</label>
               <input className="input mt-1 text-xs" value={companyBin} onChange={e => setCompanyBin(e.target.value)} />
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Company size</label>
               <select className="select mt-1 h-8 text-xs" value={companySize} onChange={e => setCompanySize(e.target.value as any)}>
                  <option value="SMALL">Small (1–20 travelers)</option>
                  <option value="MID">Mid (20–250 travelers)</option>
                  <option value="ENTERPRISE">Enterprise (250+ travelers)</option>
               </select>
            </div>
         </div>

         <div className="space-y-3">
            <div className="flex items-center gap-2">
               <User size={16} className="text-slate-600" />
               <span className="font-semibold text-sm">Admin account</span>
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Full name</label>
               <input className="input mt-1 text-xs" value={adminName} onChange={e => setAdminName(e.target.value)} />
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Work email</label>
               <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <input className="input mt-1 text-xs flex-1" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="you@company.com" />
               </div>
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Phone (optional)</label>
               <input className="input mt-1 text-xs" value={adminPhone} onChange={e => setAdminPhone(e.target.value)} placeholder="+7 700 000 00 00" />
            </div>
            <div className="text-[11px] text-slate-500">
               This user will be created as <strong>company admin</strong> with full access to settings, policies, employees and payment methods.
            </div>
         </div>
      </div>
   )
}

type Step2Props = {
   tariff: Tariff
   setTariff: (t: Tariff) => void
   expectedMonthlySpend: number
   setExpectedMonthlySpend: (v: number) => void
   preferredDueDays: number
   setPreferredDueDays: (v: number) => void
}

function Step2TariffBilling({ tariff, setTariff, expectedMonthlySpend, setExpectedMonthlySpend, preferredDueDays, setPreferredDueDays }: Step2Props) {
   const isFree = tariff === 'FREE'

   return (
      <div className="space-y-4 text-xs">
         <div className="grid md:grid-cols-3 gap-3">
            <TariffCard
               name="Free"
               code="FREE"
               price="0 ₸ / month"
               description="Fast start with basic scenarios. Good to just try the product."
               bullets={['Simple booking flow', 'Documents for corporate card / balance', 'FAQ + email support']}
               active={tariff === 'FREE'}
               onSelect={() => setTariff('FREE')}
            />
            <TariffCard
               name="Postpay"
               code="POSTPAY"
               price="по договору"
               description="Deferred payment with credit limit and invoicing."
               bullets={['Postpay & credit limit', 'Company balance & invoices', 'Chat support & SLA']}
               active={tariff === 'POSTPAY'}
               onSelect={() => setTariff('POSTPAY')}
            />
            <TariffCard
               name="Flex / VIP"
               code="FLEX"
               price="по договору"
               description="Maximum flexibility, priority support and integrations."
               bullets={['Flexible changes / refunds (where allowed)', 'Priority 24/7 care line', 'Advanced reporting & API']}
               active={tariff === 'FLEX'}
               onSelect={() => setTariff('FLEX')}
            />
         </div>

         {!isFree && (
            <div className="grid md:grid-cols-2 gap-4 mt-2">
               <div>
                  <label className="text-[11px] text-slate-500">Expected monthly travel spend (estimate)</label>
                  <input type="number" className="input mt-1 text-xs" value={expectedMonthlySpend} onChange={e => setExpectedMonthlySpend(Number(e.target.value) || 0)} />
                  <div className="text-[11px] text-slate-500 mt-1">This helps us suggest a starting credit limit and configure reporting.</div>
               </div>
               <div>
                  <label className="text-[11px] text-slate-500">Preferred payment due date after trip (days)</label>
                  <input type="number" className="input mt-1 text-xs" value={preferredDueDays} onChange={e => setPreferredDueDays(Number(e.target.value) || 0)} />
                  <div className="text-[11px] text-slate-500 mt-1">For Postpay / Flex we will show reminders “payment due in X days” in the UI.</div>
               </div>
            </div>
         )}

         <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">
            {isFree ? (
               <>
                  With <strong>Free</strong> you will go straight into the booking flow after sign-up: login → search → buy a ticket in 1–2 steps.
               </>
            ) : (
               <>
                  For <strong>Postpay / Flex</strong> we also ask to link a corporate card on the next step. It will be used as a default payment method for your company.
               </>
            )}
         </div>
      </div>
   )
}

type TariffCardProps = {
   name: string
   code: string
   price: string
   description: string
   bullets: string[]
   active: boolean
   onSelect: () => void
}

function TariffCard({ name, code, price, description, bullets, active, onSelect }: TariffCardProps) {
   return (
      <button
         type="button"
         onClick={onSelect}
         className={`text-left rounded-xl border p-3 flex flex-col justify-between hover:border-brand-400 hover:bg-brand-50/40 transition ${
            active ? 'border-brand-500 bg-brand-50/60' : 'border-slate-200 bg-white'
         }`}
      >
         <div className="space-y-1">
            <div className="flex items-center justify-between">
               <div className="font-semibold text-sm">{name}</div>
               <span className="badge-soft text-[10px] uppercase">{code}</span>
            </div>
            <div className="text-[11px] text-slate-500">{description}</div>
            <div className="mt-1 font-semibold text-[12px]">{price}</div>
            <ul className="mt-2 list-disc list-inside space-y-1 text-[11px] text-slate-600">
               {bullets.map(b => (
                  <li key={b}>{b}</li>
               ))}
            </ul>
         </div>
         <div className="mt-3 text-[11px] text-brand-700">{active ? 'Selected' : 'Select'} →</div>
      </button>
   )
}

type Step3Props = {
   cardHolder: string
   setCardHolder: (v: string) => void
   cardNumber: string
   setCardNumber: (v: string) => void
   cardExpiry: string
   setCardExpiry: (v: string) => void
   cardCvv: string
   setCardCvv: (v: string) => void
   agreeTerms: boolean
   setAgreeTerms: (v: boolean) => void
   isPostpay: boolean
   isFlex: boolean
}

function Step3Payment({
   cardHolder,
   setCardHolder,
   cardNumber,
   setCardNumber,
   cardExpiry,
   setCardExpiry,
   cardCvv,
   setCardCvv,
   agreeTerms,
   setAgreeTerms,
   isPostpay,
   isFlex,
}: Step3Props) {
   return (
      <div className="grid md:grid-cols-2 gap-5 text-xs">
         <div className="space-y-3">
            <div className="flex items-center gap-2">
               <CreditCard size={16} className="text-slate-600" />
               <span className="font-semibold text-sm">Payment details</span>
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Card holder</label>
               <input className="input mt-1 text-xs" value={cardHolder} onChange={e => setCardHolder(e.target.value)} />
            </div>
            <div>
               <label className="text-[11px] text-slate-500">Card number</label>
               <input className="input mt-1 text-xs" value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" />
            </div>
            <div className="grid grid-cols-2 gap-2">
               <div>
                  <label className="text-[11px] text-slate-500">Expiry (MM/YY)</label>
                  <input className="input mt-1 text-xs" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="12/28" />
               </div>
               <div>
                  <label className="text-[11px] text-slate-500">CVV</label>
                  <input className="input mt-1 text-xs" value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="123" />
               </div>
            </div>
         </div>

         <div className="space-y-3 text-[11px] text-slate-600">
            <div className="font-semibold text-sm">Corporate card linking</div>
            <p>
               We will simulate a small verification charge (e.g. 100 ₸) to verify the card and then reverse it. The card will be stored as a{' '}
               <strong>corporate payment method</strong> for your company.
            </p>
            <ul className="list-disc list-inside space-y-1">
               <li>Card data is tokenized by PSP; we don&apos;t store full PAN in our system.</li>
               <li>Admins can limit who can use this card for purchases (coordinators only).</li>
               <li>
                  For {isPostpay && 'Postpay'} {isPostpay && isFlex && '/ '}
                  {isFlex && 'Flex'} trips we show clear labels “paid by company card / postpay”.
               </li>
            </ul>
            <label className="mt-2 flex items-start gap-2">
               <input type="checkbox" className="mt-0.5" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
               <span>I agree with terms of service and confirm that this card may be used as a corporate payment method for business travel.</span>
            </label>
         </div>
      </div>
   )
}
