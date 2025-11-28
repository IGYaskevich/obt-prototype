import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore, Tariff } from '../state/store'
import { Building2, CreditCard, Info, Shield, Save, Trash2, Bell, Mail, Globe, Layers, Settings2, Clock, Plane, Check, Ban } from 'lucide-react'

export default function CompanySettingsPage() {
   const { user, company, hasPermission, setTariff, updateCorporateCard, travelPolicy, updateTravelPolicy } = useStore()

   if (!company) {
      return (
         <div className="space-y-4">
            <SectionHeader title="Настройки компании" subtitle="Профиль компании, документы и методы оплаты." />
            <div className="card p-4 text-sm text-red-600">Контекст компании недоступен. Пожалуйста, выполните вход заново.</div>
         </div>
      )
   }

   const canManageSettings = hasPermission('MANAGE_SETTINGS')
   const canManageTariff = hasPermission('MANAGE_TARIFFS') || canManageSettings

   /* --------------------------
    * 1. Профиль компании
    * -------------------------- */

   const [profileName, setProfileName] = useState(user?.companyName || 'Demo Company LLC')
   const [profileBin, setProfileBin] = useState('123456789012')
   const [profileAddress, setProfileAddress] = useState('Алматы, Казахстан')

   const handleSaveProfile = () => {
      alert(`Сохранение профиля компании (демо):\nНазвание: ${profileName}\nБИН: ${profileBin}\nАдрес: ${profileAddress}`)
   }

   /* --------------------------
    * 2. Методы оплаты (локально)
    * -------------------------- */

   const [enableCompanyBalance, setEnableCompanyBalance] = useState(true)
   const [enablePostpay, setEnablePostpay] = useState(company.tariff !== 'FREE')
   const [enableCorpCard, setEnableCorpCard] = useState(true)
   const [enablePersonalCard, setEnablePersonalCard] = useState(true)

   const handleSavePaymentMethods = () => {
      alert(
         [
            'Сохранение методов оплаты:',
            `• Баланс компании: ${enableCompanyBalance ? 'Включён' : 'Отключён'}`,
            `• Postpay (отсрочка): ${enablePostpay ? 'Включён' : 'Отключён'}`,
            `• Корпоративная карта: ${enableCorpCard ? 'Включена' : 'Отключена'}`,
            `• Личная карта: ${enablePersonalCard ? 'Разрешена' : 'Запрещена'}`,
         ].join('\n'),
      )
   }

   /* -----------------------------
    * 3. Документы и закрывающие
    * ----------------------------- */

   const [docEmail, setDocEmail] = useState(`${user?.email?.split('@')[0] || 'finance'}@demo.com`)
   const [docLanguage, setDocLanguage] = useState<'ru' | 'en'>('ru')
   const [autoSendDocs, setAutoSendDocs] = useState(true)

   const handleSaveDocsSettings = () => {
      alert(`Сохранение настроек документов:\nEmail: ${docEmail}\nАвто-отправка: ${autoSendDocs}\nЯзык: ${docLanguage}`)
   }

   /* --------------------------
    * 4. Департаменты и центры затрат
    * -------------------------- */

   const [departments, setDepartments] = useState<string[]>(['Финансы', 'Продажи', 'Операции'])
   const [newDept, setNewDept] = useState('')

   const [costCenters, setCostCenters] = useState<{ code: string; name: string }[]>([
      { code: 'CC-001', name: 'Штаб-квартира Казахстан' },
      { code: 'CC-010', name: 'Отдел продаж' },
   ])

   const [newCCCode, setNewCCCode] = useState('')
   const [newCCName, setNewCCName] = useState('')

   const addDepartment = () => {
      const v = newDept.trim()
      if (!v) return
      if (!departments.includes(v)) setDepartments(prev => [...prev, v])
      setNewDept('')
   }

   const removeDepartment = (d: string) => {
      setDepartments(prev => prev.filter(x => x !== d))
   }

   const addCostCenter = () => {
      const code = newCCCode.trim()
      const name = newCCName.trim()
      if (!code || !name) return

      setCostCenters(prev => [...prev, { code, name }])
      setNewCCCode('')
      setNewCCName('')
   }

   const removeCostCenter = (code: string) => {
      setCostCenters(prev => prev.filter(cc => cc.code !== code))
   }

   /* --------------------------
    * 5. Уведомления
    * -------------------------- */

   const [notifyTicketBooked, setNotifyTicketBooked] = useState(true)
   const [notifyPolicyBreach, setNotifyPolicyBreach] = useState(true)
   const [notifyPostpayDue, setNotifyPostpayDue] = useState(true)
   const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false)

   const handleSaveNotifications = () => {
      alert(
         [
            'Сохранение уведомлений:',
            `• Бронирование билета: ${notifyTicketBooked ? 'ON' : 'OFF'}`,
            `• Нарушение политики: ${notifyPolicyBreach ? 'ON' : 'OFF'}`,
            `• Напоминание Postpay: ${notifyPostpayDue ? 'ON' : 'OFF'}`,
            `• Еженедельный дайджест: ${notifyWeeklyDigest ? 'ON' : 'OFF'}`,
         ].join('\n'),
      )
   }

   /* --------------------------
    * 6. Управление тарифом
    * -------------------------- */
   const handleChangeTariff = (t: Tariff) => {
      if (!canManageTariff) return
      setTariff(t)
      if (t === 'FREE') setEnablePostpay(false)
      alert(`Тариф изменён на: ${t} (демо)`)
   }

   /* --------------------------
    * 7. Корпоративная карта
    * -------------------------- */

   const [cardBrand, setCardBrand] = useState(company.corporateCard?.brand ?? 'Visa Business')
   const [cardLast4, setCardLast4] = useState(company.corporateCard?.last4 ?? '4242')
   const [cardHolder, setCardHolder] = useState(company.corporateCard?.holder ?? user?.companyName ?? 'Demo Company LLC')
   const [cardExpiry, setCardExpiry] = useState(company.corporateCard?.expiry ?? '2027-08')
   const [cardStatus, setCardStatus] = useState<'ACTIVE' | 'BLOCKED'>(company.corporateCard?.status ?? 'ACTIVE')

   const handleBindCard = () => {
      if (!canManageSettings) return
      if (!cardBrand.trim() || !cardLast4.trim() || !cardHolder.trim()) {
         alert('Заполните все поля карты')
         return
      }
      if (cardLast4.length !== 4 || !/^\d{4}$/.test(cardLast4)) {
         alert('Введите последние 4 цифры карты')
         return
      }

      updateCorporateCard({
         brand: cardBrand.trim(),
         last4: cardLast4.trim(),
         holder: cardHolder.trim(),
         expiry: cardExpiry.trim(),
         status: cardStatus,
      })

      alert('Корпоративная карта привязана (симуляция).')
   }

   const handleUnbindCard = () => {
      if (!canManageSettings) return
      if (!window.confirm('Удалить корпоративную карту?')) return
      updateCorporateCard(null)
   }

   /* --------------------------
    * 8. Тревел-политика
    * -------------------------- */

   const [policySoftLimit, setPolicySoftLimit] = useState(travelPolicy.softLimit)
   const [policyBlockLimit, setPolicyBlockLimit] = useState(travelPolicy.blockLimit)
   const [policyPreferredFrom, setPolicyPreferredFrom] = useState(travelPolicy.preferredFrom)
   const [policyPreferredTo, setPolicyPreferredTo] = useState(travelPolicy.preferredTo)
   const [policyAllowedClasses, setPolicyAllowedClasses] = useState<string[]>(travelPolicy.allowedClasses)
   const [policyAllowConnections, setPolicyAllowConnections] = useState(travelPolicy.allowConnections)
   const [policyMaxConnectionTime, setPolicyMaxConnectionTime] = useState(travelPolicy.maxConnectionTime)
   const [policyHandBaggageOnly, setPolicyHandBaggageOnly] = useState(travelPolicy.handBaggageOnly)

   const togglePolicyClass = (cl: string) => {
      setPolicyAllowedClasses(prev => (prev.includes(cl) ? prev.filter(x => x !== cl) : [...prev, cl]))
   }

   const handleSaveTravelPolicy = () => {
      updateTravelPolicy({
         softLimit: policySoftLimit,
         blockLimit: policyBlockLimit,
         preferredFrom: policyPreferredFrom,
         preferredTo: policyPreferredTo,
         allowedClasses: policyAllowedClasses,
         allowConnections: policyAllowConnections,
         maxConnectionTime: policyMaxConnectionTime,
         handBaggageOnly: policyHandBaggageOnly,
      })

      alert(
         [
            'Тревел-политика сохранена:',
            `• Soft-limit: ${policySoftLimit}`,
            `• Block-limit: ${policyBlockLimit}`,
            `• Окно вылета: ${policyPreferredFrom}–${policyPreferredTo}`,
            `• Классы: ${policyAllowedClasses.join(', ')}`,
            `• Стыковки: ${policyAllowConnections}`,
            `• Макс. стыковка: ${policyMaxConnectionTime} мин`,
            `• Только ручная кладь: ${policyHandBaggageOnly}`,
         ].join('\n'),
      )
   }

   /* -----------------------------
    * UI РЕНДЕРИНГ
    * ----------------------------- */

   return (
      <div className="space-y-6">
         <SectionHeader title="Настройки компании" subtitle="Профиль компании, методы оплаты, тревел-политика, документы, уведомления и тариф." />

         {/* 1. ПРОФИЛЬ */}
         <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
               <Building2 size={18} className="mt-[2px] text-slate-600" />
               <div>
                  <div className="font-semibold mb-2">Профиль компании</div>
                  <div className="space-y-2 text-xs">
                     <Field label="Название компании" value={profileName} onChange={setProfileName} disabled={!canManageSettings} />
                     <Field label="БИН / ИНН" value={profileBin} onChange={setProfileBin} disabled={!canManageSettings} />
                     <Field label="Юридический адрес" value={profileAddress} onChange={setProfileAddress} disabled={!canManageSettings} />
                  </div>
               </div>
            </div>

            <div className="text-xs text-slate-600 flex items-start gap-2">
               <Info size={14} className="mt-[2px]" />
               <span>Профиль используется в счетах, актах и внутренних отчётах. В прототипе сохраняется только локально.</span>
            </div>

            <div className="flex flex-col justify-between text-xs">
               <div className="text-slate-600">
                  <div>
                     Текущий тариф: <span className="badge-soft">{company.tariff}</span>
                  </div>
                  <div className="mt-1">Баланс: {company.balance.toLocaleString('ru-RU')} KZT</div>
                  <div className="mt-1">
                     Лимит Postpay: {company.postpayLimit.toLocaleString('ru-RU')} KZT • {company.postpayDueDays} дней до оплаты
                  </div>
               </div>

               <div className="flex justify-end mt-3">
                  <button className="btn-primary flex items-center gap-1 text-xs" onClick={handleSaveProfile} disabled={!canManageSettings}>
                     <Save size={14} />
                     Сохранить профиль
                  </button>
               </div>
            </div>
         </div>

         {/* 2. МЕТОДЫ ОПЛАТЫ */}
         <div className="card p-4 grid md:grid-cols-2 gap-4 text-sm">
            {/* Левая часть */}
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                     <CreditCard size={16} className="text-slate-600" />
                     Методы оплаты
                  </h2>
                  {!canManageSettings && <span className="text-[11px] text-slate-400">Только просмотр</span>}
               </div>

               <div className="space-y-2 text-xs">
                  <ToggleRow
                     label="Баланс компании"
                     description="Оплата с доступного баланса."
                     checked={enableCompanyBalance}
                     onChange={setEnableCompanyBalance}
                     disabled={!canManageSettings}
                  />

                  <ToggleRow
                     label="Postpay (отсрочка)"
                     description={`Оплата по лимиту (${company.postpayLimit.toLocaleString('ru-RU')} KZT).`}
                     checked={enablePostpay}
                     onChange={setEnablePostpay}
                     disabled={!canManageSettings}
                  />

                  <ToggleRow
                     label="Корпоративная карта"
                     description="Оплата сохранённой картой компании."
                     checked={enableCorpCard}
                     onChange={setEnableCorpCard}
                     disabled={!canManageSettings}
                  />

                  <ToggleRow
                     label="Личная карта"
                     description="Оплата личной картой сотрудника."
                     checked={enablePersonalCard}
                     onChange={setEnablePersonalCard}
                     disabled={!canManageSettings}
                  />
               </div>

               <div className="flex justify-end">
                  <button className="btn-primary text-xs flex items-center gap-1" onClick={handleSavePaymentMethods} disabled={!canManageSettings}>
                     <Save size={14} />
                     Сохранить методы оплаты
                  </button>
               </div>
            </div>

            {/* Правая часть — корпоративная карта */}
            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <h2 className="font-semibold flex items-center gap-2">
                     <CreditCard size={16} className="text-slate-600" />
                     Корпоративная карта
                  </h2>
                  {!canManageSettings && <span className="text-[11px] text-slate-400">Только просмотр</span>}
               </div>

               {company.corporateCard ? (
                  <>
                     {/* Текущая карта */}
                     <div className="text-xs space-y-1">
                        <div className="font-medium">
                           {company.corporateCard.brand} <span className="text-slate-500">•••• {company.corporateCard.last4}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">Владение: {company.corporateCard.holder}</div>
                        <div className="text-[11px] text-slate-500">Истекает: {company.corporateCard.expiry}</div>
                        <div className="text-[11px] text-slate-500">
                           Статус:{' '}
                           <span className={company.corporateCard.status === 'ACTIVE' ? 'text-emerald-600' : 'text-red-600'}>
                              {company.corporateCard.status === 'ACTIVE' ? 'Активна' : 'Заблокирована'}
                           </span>
                        </div>
                     </div>

                     {/* Редактирование */}
                     <div className="border-t pt-3 mt-3 text-xs space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                           <Field label="Продукт / бренд карты" value={cardBrand} onChange={setCardBrand} disabled={!canManageSettings} />
                           <Field label="Последние 4 цифры" value={cardLast4} onChange={setCardLast4} disabled={!canManageSettings} placeholder="1234" />
                           <Field label="Владелец карты" value={cardHolder} onChange={setCardHolder} disabled={!canManageSettings} />
                           <Field label="Срок (YYYY-MM)" value={cardExpiry} onChange={setCardExpiry} disabled={!canManageSettings} placeholder="2027-08" />
                        </div>

                        <div className="flex justify-between items-center">
                           <div className="text-[11px] text-slate-600">
                              Статус
                              <select
                                 className="select ml-2 h-8 text-xs"
                                 value={cardStatus}
                                 onChange={e => setCardStatus(e.target.value as 'ACTIVE' | 'BLOCKED')}
                                 disabled={!canManageSettings}
                              >
                                 <option value="ACTIVE">Активна</option>
                                 <option value="BLOCKED">Заблокирована</option>
                              </select>
                           </div>

                           <div className="flex gap-2">
                              <button className="btn-ghost text-red-600 text-xs flex items-center gap-1" onClick={handleUnbindCard} disabled={!canManageSettings}>
                                 <Trash2 size={14} />
                                 Удалить
                              </button>

                              <button className="btn-primary text-xs flex items-center gap-1" onClick={handleBindCard} disabled={!canManageSettings}>
                                 <Save size={14} />
                                 Сохранить
                              </button>
                           </div>
                        </div>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="text-xs text-slate-600">Карта ещё не привязана. В реальном продукте — через PSP.</div>

                     <div className="grid md:grid-cols-2 gap-3 text-xs mt-2">
                        <Field label="Продукт / бренд карты" value={cardBrand} onChange={setCardBrand} disabled={!canManageSettings} placeholder="Visa Business" />
                        <Field label="Последние 4 цифры" value={cardLast4} onChange={setCardLast4} disabled={!canManageSettings} placeholder="4242" />
                        <Field label="Владелец карты" value={cardHolder} onChange={setCardHolder} disabled={!canManageSettings} placeholder="Demo Company LLC" />
                        <Field label="Срок (YYYY-MM)" value={cardExpiry} onChange={setCardExpiry} disabled={!canManageSettings} placeholder="2027-08" />
                     </div>

                     <div className="flex justify-end mt-3">
                        <button className="btn-primary flex items-center gap-1 text-xs" onClick={handleBindCard} disabled={!canManageSettings}>
                           <CreditCard size={14} />
                           Привязать карту (демо)
                        </button>
                     </div>
                  </>
               )}
            </div>
         </div>

         {/* 3. ТРЕВЕЛ-ПОЛИТИКА */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <h2 className="font-semibold flex items-center gap-2">
                  <Shield size={16} className="text-slate-600" />
                  Тревел-политика
               </h2>
               {!canManageSettings && <span className="text-[11px] text-slate-400">Только просмотр</span>}
            </div>

            {/* краткий обзор */}
            <div className="grid md:grid-cols-3 gap-4 text-xs">
               <div className="flex items-start gap-2">
                  <Info size={14} className="mt-[2px] text-slate-500" />
                  <div>
                     <div className="font-semibold text-[11px]">Как используется политика</div>
                     <div className="mt-1 text-[11px] text-slate-600">Эти правила определяют маркировку билетов OK/WARN/BLOCK при поиске.</div>
                  </div>
               </div>

               <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">Логика цены</span>
                  <div className="mt-1">OK: ниже {policySoftLimit.toLocaleString('ru-RU')} KZT</div>
                  <div>
                     WARN: {policySoftLimit.toLocaleString('ru-RU')} – {policyBlockLimit.toLocaleString('ru-RU')} KZT
                  </div>
                  <div>BLOCK: выше {policyBlockLimit.toLocaleString('ru-RU')} KZT</div>
               </div>

               <div className="text-[11px] text-slate-600">
                  <span className="font-semibold">Время и стыковки</span>
                  <div className="mt-1">
                     Окно вылета: {policyPreferredFrom}–{policyPreferredTo}
                  </div>
                  <div>Стыковки: {policyAllowConnections ? `разрешены (до ${policyMaxConnectionTime} мин)` : 'запрещены'}</div>
               </div>
            </div>

            {/* правила цены */}
            <div className="border-t pt-3 space-y-3">
               <div className="flex items-center gap-2 text-sm">
                  <Plane size={16} className="text-slate-600" />
                  <span className="font-semibold">Правила цены</span>
               </div>

               <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <Field label="Soft-limit (KZT)" value={policySoftLimit.toString()} onChange={v => setPolicySoftLimit(Number(v) || 0)} disabled={!canManageSettings} />
                  <Field label="Block-limit (KZT)" value={policyBlockLimit.toString()} onChange={v => setPolicyBlockLimit(Number(v) || 0)} disabled={!canManageSettings} />
                  <div className="text-[11px] text-slate-500 flex items-start gap-2">
                     <Info size={14} className="mt-[2px]" />
                     <span>Soft = предупреждение. Block = билет не может быть куплен.</span>
                  </div>
               </div>
            </div>

            {/* правила времени */}
            <div className="border-t pt-3 space-y-3">
               <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-slate-600" />
                  <span className="font-semibold">Окно вылета</span>
               </div>

               <div className="grid md:grid-cols-3 gap-4 text-xs">
                  <Field label="От" type="time" value={policyPreferredFrom} onChange={setPolicyPreferredFrom} disabled={!canManageSettings} />
                  <Field label="До" type="time" value={policyPreferredTo} onChange={setPolicyPreferredTo} disabled={!canManageSettings} />
                  <div className="text-[11px] text-slate-500">Билеты вне этого окна будут помечены как WARN.</div>
               </div>
            </div>

            {/* классы + дополнительные правила */}
            <div className="border-t pt-3 grid md:grid-cols-2 gap-4 text-sm">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <Check size={16} className="text-slate-600" />
                     <span className="font-semibold">Разрешённые классы</span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs">
                     {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS'].map(cl => (
                        <label key={cl} className="flex items-center gap-1">
                           <input type="checkbox" checked={policyAllowedClasses.includes(cl)} onChange={() => togglePolicyClass(cl)} disabled={!canManageSettings} />
                           {cl.replace('_', ' ')}
                        </label>
                     ))}
                  </div>

                  <div className="text-[11px] text-slate-500">Билет вне разрешённого класса = BLOCK.</div>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <Ban size={16} className="text-slate-600" />
                     <span className="font-semibold">Дополнительные правила</span>
                  </div>

                  <div className="space-y-3 text-xs">
                     <ToggleRow label="Разрешить стыковки" checked={policyAllowConnections} onChange={setPolicyAllowConnections} disabled={!canManageSettings} />

                     {policyAllowConnections && (
                        <Field
                           label="Макс. стыковка (мин)"
                           value={policyMaxConnectionTime.toString()}
                           onChange={v => setPolicyMaxConnectionTime(Number(v) || 0)}
                           disabled={!canManageSettings}
                        />
                     )}

                     <ToggleRow label="Только ручная кладь" checked={policyHandBaggageOnly} onChange={setPolicyHandBaggageOnly} disabled={!canManageSettings} />
                  </div>
               </div>
            </div>

            <div className="flex justify-end">
               <button className="btn-primary flex items-center gap-1 text-xs" onClick={handleSaveTravelPolicy} disabled={!canManageSettings}>
                  <Save size={14} />
                  Сохранить тревел-политику
               </button>
            </div>
         </div>

         {/* 4. Департаменты */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <h2 className="font-semibold flex items-center gap-2">
                  <Layers size={16} className="text-slate-600" />
                  Департаменты и центры затрат
               </h2>
               {!canManageSettings && <span className="text-[11px] text-slate-400">Только просмотр</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-xs">
               {/* Департаменты */}
               <div>
                  <div className="font-semibold text-[11px] mb-2">Департаменты</div>

                  <div className="flex flex-wrap gap-2 mb-3">
                     {departments.map(d => (
                        <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200">
                           {d}
                           {canManageSettings && (
                              <button className="text-[10px] text-slate-400" onClick={() => removeDepartment(d)}>
                                 ×
                              </button>
                           )}
                        </span>
                     ))}
                     {departments.length === 0 && <span className="text-slate-400">Нет департаментов</span>}
                  </div>

                  <div className="flex gap-2">
                     <input
                        className="input h-8 text-xs"
                        placeholder="Добавить департамент"
                        value={newDept}
                        onChange={e => setNewDept(e.target.value)}
                        disabled={!canManageSettings}
                     />

                     <button className="btn-primary h-8 text-[11px]" onClick={addDepartment} disabled={!canManageSettings || !newDept.trim()}>
                        Добавить
                     </button>
                  </div>
               </div>

               {/* Центры затрат */}
               <div>
                  <div className="font-semibold text-[11px] mb-2">Центры затрат</div>

                  <div className="space-y-1 mb-2">
                     {costCenters.map(cc => (
                        <div key={cc.code} className="px-2 py-1 border rounded bg-slate-50 flex justify-between items-center">
                           <div>
                              <div className="font-mono text-[11px]">{cc.code}</div>
                              <div className="text-[11px] text-slate-600">{cc.name}</div>
                           </div>

                           {canManageSettings && (
                              <button className="btn-ghost text-red-600 text-[11px]" onClick={() => removeCostCenter(cc.code)}>
                                 Удалить
                              </button>
                           )}
                        </div>
                     ))}

                     {costCenters.length === 0 && <div className="text-slate-400 text-xs">Нет центров затрат</div>}
                  </div>

                  <div className="grid grid-cols-[auto,1fr] gap-2">
                     <input
                        className="input h-8 text-xs"
                        placeholder="Код (например CC-020)"
                        value={newCCCode}
                        onChange={e => setNewCCCode(e.target.value)}
                        disabled={!canManageSettings}
                     />

                     <input className="input h-8 text-xs" placeholder="Название" value={newCCName} onChange={e => setNewCCName(e.target.value)} disabled={!canManageSettings} />
                  </div>

                  <div className="flex justify-end mt-2">
                     <button className="btn-primary h-8 text-[11px]" onClick={addCostCenter} disabled={!canManageSettings || !newCCCode.trim() || !newCCName.trim()}>
                        Добавить центр затрат
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* 5. ДОКУМЕНТЫ */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <h2 className="font-semibold flex items-center gap-2">
                  <Globe size={16} className="text-slate-600" />
                  Документы и счета
               </h2>
               {!canManageSettings && <span className="text-[11px] text-slate-400">Только просмотр</span>}
            </div>

            <div className="grid md:grid-cols-3 gap-3 text-xs">
               <div>
                  <label className="text-[11px] text-slate-500">Email для документов</label>
                  <input className="input mt-1 h-8" value={docEmail} onChange={e => setDocEmail(e.target.value)} disabled={!canManageSettings} />
                  <div className="text-[10px] text-slate-500 mt-1">Все счета и акты будут отправляться на этот email.</div>
               </div>

               <div>
                  <label className="text-[11px] text-slate-500">Язык документов</label>
                  <select className="select mt-1 h-8" value={docLanguage} onChange={e => setDocLanguage(e.target.value as 'ru' | 'en')} disabled={!canManageSettings}>
                     <option value="ru">Русский</option>
                     <option value="en">Английский</option>
                  </select>
               </div>

               <div>
                  <label className="text-[11px] text-slate-500">Автоматическая отправка</label>
                  <div className="mt-1 flex items-center gap-2">
                     <input type="checkbox" checked={autoSendDocs} onChange={e => setAutoSendDocs(e.target.checked)} disabled={!canManageSettings} />
                     <span className="text-[11px] text-slate-600">Отправлять счет и акт автоматически</span>
                  </div>
               </div>
            </div>

            <div className="flex justify-end">
               <button className="btn-primary flex items-center gap-1 text-xs" onClick={handleSaveDocsSettings} disabled={!canManageSettings}>
                  <Save size={14} />
                  Сохранить
               </button>
            </div>
         </div>

         {/* 6. УВЕДОМЛЕНИЯ */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <h2 className="font-semibold flex items-center gap-2">
                  <Bell size={16} className="text-slate-600" />
                  Уведомления
               </h2>
               {!canManageSettings && <span className="text-[11px] text-slate-400">Только просмотр</span>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
               <ToggleRow
                  icon={<Mail size={12} className="text-slate-500" />}
                  label="Билет забронирован"
                  description="Уведомлять при успешном бронировании билета."
                  checked={notifyTicketBooked}
                  onChange={setNotifyTicketBooked}
                  disabled={!canManageSettings}
               />

               <ToggleRow
                  icon={<Shield size={12} className="text-slate-500" />}
                  label="Нарушение политики"
                  description="Отправлять предупреждение, если опция вне политики."
                  checked={notifyPolicyBreach}
                  onChange={setNotifyPolicyBreach}
                  disabled={!canManageSettings}
               />

               <ToggleRow
                  icon={<CreditCard size={12} className="text-slate-500" />}
                  label="Напоминания Postpay"
                  description="Напоминания о скорых сроках оплаты по Postpay."
                  checked={notifyPostpayDue}
                  onChange={setNotifyPostpayDue}
                  disabled={!canManageSettings}
               />

               <ToggleRow
                  icon={<Settings2 size={12} className="text-slate-500" />}
                  label="Еженедельный дайджест"
                  description="Сводка недели: расходы, поездки, нарушения."
                  checked={notifyWeeklyDigest}
                  onChange={setNotifyWeeklyDigest}
                  disabled={!canManageSettings}
               />
            </div>

            <div className="flex justify-end">
               <button className="btn-primary flex items-center gap-1 text-xs" onClick={handleSaveNotifications} disabled={!canManageSettings}>
                  <Save size={14} />
                  Сохранить
               </button>
            </div>
         </div>

         {/* 7. ТАРИФЫ */}
         <div className="card p-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
               <h2 className="font-semibold flex items-center gap-2">
                  <Settings2 size={16} className="text-slate-600" />
                  Управление тарифом
               </h2>
               {!canManageTariff && <span className="text-[11px] text-slate-400">Только администратор может менять тариф</span>}
            </div>

            <div className="grid md:grid-cols-3 gap-3 text-xs">
               <TariffCard
                  name="FREE"
                  current={company.tariff}
                  title="Free"
                  description="Базовый тариф без SLA. Быстрый и простой флоу."
                  onSelect={() => handleChangeTariff('FREE')}
                  disabled={!canManageTariff}
               />

               <TariffCard
                  name="POSTPAY"
                  current={company.tariff}
                  title="Postpay"
                  description="Отсрочка оплаты + сервисный сбор + поддержка."
                  onSelect={() => handleChangeTariff('POSTPAY')}
                  disabled={!canManageTariff}
               />

               <TariffCard
                  name="FLEX"
                  current={company.tariff}
                  title="Flex / VIP"
                  description="Максимальная гибкость, SLA, приоритетная поддержка."
                  onSelect={() => handleChangeTariff('FLEX')}
                  disabled={!canManageTariff}
               />
            </div>
         </div>
      </div>
   )
}

/* ---------------------------------------------
 * МЕЛКИЕ КОМПОНЕНТЫ (Field, ToggleRow, TariffCard)
 * --------------------------------------------- */

function Field({
   label,
   value,
   onChange,
   disabled,
   placeholder,
   type = 'text',
}: {
   label: string
   value: string
   onChange: (v: string) => void
   disabled?: boolean
   placeholder?: string
   type?: string
}) {
   return (
      <div className="space-y-1">
         <label className="text-[11px] text-slate-500">{label}</label>
         <input type={type} className="input h-8 text-xs mt-1" value={value} onChange={e => onChange(e.target.value)} disabled={disabled} placeholder={placeholder} />
      </div>
   )
}

function ToggleRow({
   label,
   description,
   checked,
   onChange,
   disabled,
   icon,
}: {
   label: string
   description?: string
   checked: boolean
   onChange: (v: boolean) => void
   disabled?: boolean
   icon?: React.ReactNode
}) {
   return (
      <div className="flex items-start gap-3">
         <div className="mt-1">
            <input type="checkbox" className="h-4 w-4" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
         </div>
         <div className="space-y-1">
            <div className="flex items-center gap-1">
               {icon}
               <span className="font-semibold text-[11px]">{label}</span>
            </div>
            {description && <div className="text-[11px] text-slate-600">{description}</div>}
         </div>
      </div>
   )
}

function TariffCard({
   name,
   current,
   title,
   description,
   onSelect,
   disabled,
}: {
   name: Tariff
   current: Tariff
   title: string
   description: string
   onSelect: () => void
   disabled?: boolean
}) {
   const active = current === name

   return (
      <button
         type="button"
         className={`text-left border rounded-lg p-3 flex flex-col gap-1 text-xs ${
            active ? 'border-sky-500 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'
         } disabled:opacity-50`}
         onClick={onSelect}
         disabled={disabled}
      >
         <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{title}</span>
            {active && <span className="badge-soft text-[10px] border border-sky-300 bg-sky-50">текущий</span>}
         </div>
         <div className="text-[11px] text-slate-600">{description}</div>
      </button>
   )
}
