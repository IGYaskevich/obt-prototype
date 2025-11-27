import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore, Tariff } from '../state/store'
import {
    Building2,
    CreditCard,
    Info,
    Shield,
    Save,
    Trash2,
    Bell,
    Mail,
    Globe,
    Layers,
    Settings2,
    Clock,
    Plane,
    Check,
    Ban,
} from 'lucide-react'

export default function CompanySettingsPage() {
    const {
        user,
        company,
        hasPermission,
        setTariff,
        updateCorporateCard,
        travelPolicy,
        updateTravelPolicy,
    } = useStore()

    if (!company) {
        return (
            <div className="space-y-4">
                <SectionHeader
                    title="Company settings"
                    subtitle="Company profile, documents and payment configuration."
                />
                <div className="card p-4 text-sm text-red-600">
                    Company context is not available. Please log in again.
                </div>
            </div>
        )
    }

    const canManageSettings = hasPermission('MANAGE_SETTINGS')
    const canManageTariff = hasPermission('MANAGE_TARIFFS') || canManageSettings

    /* ---- COMPANY PROFILE (local mocks) ---- */

    const [profileName, setProfileName] = useState(user?.companyName || 'Demo Company LLC')
    const [profileBin, setProfileBin] = useState('123456789012')
    const [profileAddress, setProfileAddress] = useState('Almaty, Kazakhstan')

    const handleSaveProfile = () => {
        alert(
            `Saving company profile (mock):\nName: ${profileName}\nBIN: ${profileBin}\nAddress: ${profileAddress}`
        )
    }

    /* ---- PAYMENT METHODS (config, local) ---- */

    const [enableCompanyBalance, setEnableCompanyBalance] = useState(true)
    const [enablePostpay, setEnablePostpay] = useState(company.tariff !== 'FREE')
    const [enableCorpCard, setEnableCorpCard] = useState(true)
    const [enablePersonalCard, setEnablePersonalCard] = useState(true)

    const handleSavePaymentMethods = () => {
        alert(
            [
                'Saving payment methods (mock):',
                `• Company balance: ${enableCompanyBalance ? 'ON' : 'OFF'}`,
                `• Postpay: ${enablePostpay ? 'ON' : 'OFF'}`,
                `• Corporate card: ${enableCorpCard ? 'ON' : 'OFF'}`,
                `• Personal card: ${enablePersonalCard ? 'ON' : 'OFF'}`,
            ].join('\n')
        )
    }

    /* ---- DOCUMENTS & INVOICES ---- */

    const [docEmail, setDocEmail] = useState(
        `${user?.email?.split('@')[0] || 'finance'}@demo.com`
    )
    const [docLanguage, setDocLanguage] = useState<'ru' | 'en'>('ru')
    const [autoSendDocs, setAutoSendDocs] = useState(true)

    const handleSaveDocsSettings = () => {
        alert(
            `Saving documents settings:\nEmail: ${docEmail}\nAuto-send: ${autoSendDocs}\nLanguage: ${docLanguage}`
        )
    }

    /* ---- DEPARTMENTS & COST CENTERS (local) ---- */

    const [departments, setDepartments] = useState<string[]>(['Finance', 'Sales', 'Operations'])
    const [newDept, setNewDept] = useState('')

    const [costCenters, setCostCenters] = useState<{ code: string; name: string }[]>([
        { code: 'CC-001', name: 'Kazakhstan HQ' },
        { code: 'CC-010', name: 'Sales team' },
    ])
    const [newCCCode, setNewCCCode] = useState('')
    const [newCCName, setNewCCName] = useState('')

    const addDepartment = () => {
        const v = newDept.trim()
        if (!v) return
        if (!departments.includes(v)) {
            setDepartments(prev => [...prev, v])
        }
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

    /* ---- NOTIFICATIONS & ALERTS (local) ---- */

    const [notifyTicketBooked, setNotifyTicketBooked] = useState(true)
    const [notifyPolicyBreach, setNotifyPolicyBreach] = useState(true)
    const [notifyPostpayDue, setNotifyPostpayDue] = useState(true)
    const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false)

    const handleSaveNotifications = () => {
        alert(
            [
                'Saving notifications (mock):',
                `• Ticket booked: ${notifyTicketBooked ? 'ON' : 'OFF'}`,
                `• Policy breach: ${notifyPolicyBreach ? 'ON' : 'OFF'}`,
                `• Postpay due reminders: ${notifyPostpayDue ? 'ON' : 'OFF'}`,
                `• Weekly digest: ${notifyWeeklyDigest ? 'ON' : 'OFF'}`,
            ].join('\n')
        )
    }

    /* ---- TARIFF MANAGEMENT ---- */

    const handleChangeTariff = (t: Tariff) => {
        if (!canManageTariff) return
        setTariff(t)
        if (t === 'FREE') {
            setEnablePostpay(false)
        }
        alert(`Tariff switched to ${t} (mock)`)
    }

    /* ---- CORPORATE CARD (using updateCorporateCard) ---- */

    const [cardBrand, setCardBrand] = useState(company.corporateCard?.brand ?? 'Visa Business')
    const [cardLast4, setCardLast4] = useState(company.corporateCard?.last4 ?? '4242')
    const [cardHolder, setCardHolder] = useState(
        company.corporateCard?.holder ?? (user?.companyName || 'Demo Company LLC')
    )
    const [cardExpiry, setCardExpiry] = useState(company.corporateCard?.expiry ?? '2027-08')
    const [cardStatus, setCardStatus] = useState<'ACTIVE' | 'BLOCKED'>(
        company.corporateCard?.status ?? 'ACTIVE'
    )

    const handleBindCard = () => {
        if (!canManageSettings) return
        if (!cardBrand.trim() || !cardLast4.trim() || !cardHolder.trim() || !cardExpiry.trim()) {
            alert('Please fill all card fields')
            return
        }
        if (cardLast4.length !== 4 || !/^\d{4}$/.test(cardLast4)) {
            alert('Please enter last 4 digits of the card')
            return
        }

        updateCorporateCard({
            brand: cardBrand.trim(),
            last4: cardLast4.trim(),
            holder: cardHolder.trim(),
            expiry: cardExpiry.trim(),
            status: cardStatus,
        })

        alert(
            'Corporate card is linked (simulated). In real product it would be done via PSP during registration/onboarding.'
        )
    }

    const handleUnbindCard = () => {
        if (!canManageSettings) return
        if (!window.confirm('Remove corporate card binding for this company?')) return
        updateCorporateCard(null)
    }

    /* ---- TRAVEL POLICY SETTINGS (connected to store.travelPolicy) ---- */

    const [policySoftLimit, setPolicySoftLimit] = useState(travelPolicy.softLimit)
    const [policyBlockLimit, setPolicyBlockLimit] = useState(travelPolicy.blockLimit)
    const [policyPreferredFrom, setPolicyPreferredFrom] = useState(travelPolicy.preferredFrom)
    const [policyPreferredTo, setPolicyPreferredTo] = useState(travelPolicy.preferredTo)
    const [policyAllowedClasses, setPolicyAllowedClasses] = useState<string[]>(
        travelPolicy.allowedClasses
    )
    const [policyAllowConnections, setPolicyAllowConnections] = useState(
        travelPolicy.allowConnections
    )
    const [policyMaxConnectionTime, setPolicyMaxConnectionTime] = useState(
        travelPolicy.maxConnectionTime
    )
    const [policyHandBaggageOnly, setPolicyHandBaggageOnly] = useState(
        travelPolicy.handBaggageOnly
    )

    const togglePolicyClass = (cl: string) => {
        setPolicyAllowedClasses(prev =>
            prev.includes(cl) ? prev.filter(x => x !== cl) : [...prev, cl]
        )
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
                'Travel policy saved (simulated):',
                `• Soft limit: ${policySoftLimit}`,
                `• Block limit: ${policyBlockLimit}`,
                `• Preferred window: ${policyPreferredFrom}–${policyPreferredTo}`,
                `• Allowed classes: ${policyAllowedClasses.join(', ')}`,
                `• Allow connections: ${policyAllowConnections}`,
                `• Max connection time: ${policyMaxConnectionTime} min`,
                `• Hand baggage only: ${policyHandBaggageOnly}`,
            ].join('\n')
        )
    }

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Company settings"
                subtitle="Configure company profile, payment methods, travel policy, documents, notifications and tariff."
            />

            {/* 1. COMPANY PROFILE */}
            <div className="card p-4 grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                    <Building2 size={18} className="mt-1 text-slate-500" />
                    <div>
                        <div className="font-semibold mb-2">Company profile</div>
                        <div className="space-y-2 text-xs">
                            <Field
                                label="Company name"
                                value={profileName}
                                onChange={setProfileName}
                                disabled={!canManageSettings}
                            />
                            <Field
                                label="BIN / Tax ID"
                                value={profileBin}
                                onChange={setProfileBin}
                                disabled={!canManageSettings}
                            />
                            <Field
                                label="Legal address"
                                value={profileAddress}
                                onChange={setProfileAddress}
                                disabled={!canManageSettings}
                            />
                        </div>
                    </div>
                </div>

                <div className="text-xs text-slate-600 flex items-start gap-2">
                    <Info size={14} className="mt-[2px] text-slate-500" />
                    <span>
            Company profile is used across invoices, acts and internal reports. In this prototype we
            keep it local, without real backend updates.
          </span>
                </div>

                <div className="flex flex-col justify-between text-xs">
                    <div className="text-slate-600">
                        <div>
                            Current tariff:{' '}
                            <span className="badge-soft">
                {company.tariff}
              </span>
                        </div>
                        <div className="mt-1">
                            Balance: {company.balance.toLocaleString('ru-RU')} KZT
                        </div>
                        <div className="mt-1">
                            Postpay limit: {company.postpayLimit.toLocaleString('ru-RU')} KZT •{' '}
                            {company.postpayDueDays} days due
                        </div>
                    </div>
                    <div className="flex justify-end mt-3">
                        <button
                            className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                            onClick={handleSaveProfile}
                            disabled={!canManageSettings}
                        >
                            <Save size={14} />
                            Save profile
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. PAYMENT METHODS + CORPORATE CARD */}
            <div className="card p-4 grid md:grid-cols-2 gap-4 text-sm">
                {/* 2.1 Payment methods toggles */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm flex items-center gap-2">
                            <CreditCard size={16} className="text-slate-600" />
                            Payment methods
                        </h2>
                        {!canManageSettings && (
                            <span className="text-[11px] text-slate-400">Read-only for coordinator</span>
                        )}
                    </div>
                    <div className="space-y-2 text-xs">
                        <ToggleRow
                            label="Company balance"
                            description="Use pre-loaded company balance for purchases. Recommended for Free and Flex tariffs."
                            checked={enableCompanyBalance}
                            onChange={setEnableCompanyBalance}
                            disabled={!canManageSettings}
                        />
                        <ToggleRow
                            label="Postpay (deferred payment)"
                            description={`Use postpay limit (${company.postpayLimit.toLocaleString(
                                'ru-RU'
                            )} KZT, ${company.postpayDueDays} days due). Mostly for Postpay tariff.`}
                            checked={enablePostpay}
                            onChange={setEnablePostpay}
                            disabled={!canManageSettings}
                        />
                        <ToggleRow
                            label="Corporate card"
                            description="Use saved corporate card as payment method. Data is tokenized by PSP in production."
                            checked={enableCorpCard}
                            onChange={setEnableCorpCard}
                            disabled={!canManageSettings}
                        />
                        <ToggleRow
                            label="Personal card"
                            description="Allow employees to pay with personal card (usually no closing documents)."
                            checked={enablePersonalCard}
                            onChange={setEnablePersonalCard}
                            disabled={!canManageSettings}
                        />
                    </div>
                    <div className="flex justify-end mt-2">
                        <button
                            className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                            onClick={handleSavePaymentMethods}
                            disabled={!canManageSettings}
                        >
                            <Save size={14} />
                            Save payment methods
                        </button>
                    </div>
                </div>

                {/* 2.2 Corporate card binding */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-sm flex items-center gap-2">
                            <CreditCard size={16} className="text-slate-600" />
                            Corporate payment card
                        </h2>
                        {!canManageSettings && (
                            <span className="text-[11px] text-slate-400">Read-only</span>
                        )}
                    </div>

                    {company.corporateCard ? (
                        <>
                            <div className="flex flex-col gap-1 text-xs">
                                <div className="font-medium">
                                    {company.corporateCard.brand}{' '}
                                    <span className="text-slate-500">•••• {company.corporateCard.last4}</span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    Holder: {company.corporateCard.holder}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    Expiry: {company.corporateCard.expiry}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                    Status:{' '}
                                    <span
                                        className={
                                            company.corporateCard.status === 'ACTIVE'
                                                ? 'text-emerald-600'
                                                : 'text-red-600'
                                        }
                                    >
                    {company.corporateCard.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500 mt-1">
                                    Card is used when user selects “Corporate card” at payment step. In real system
                                    details come from PSP.
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-3 mt-2 space-y-3 text-xs">
                                <div className="text-[11px] text-slate-500">
                                    In this prototype you can edit card data. In production it is read-only.
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <Field
                                        label="Card product / brand"
                                        value={cardBrand}
                                        onChange={setCardBrand}
                                        disabled={!canManageSettings}
                                    />
                                    <Field
                                        label="Last 4 digits"
                                        value={cardLast4}
                                        onChange={setCardLast4}
                                        disabled={!canManageSettings}
                                        placeholder="1234"
                                    />
                                    <Field
                                        label="Card holder"
                                        value={cardHolder}
                                        onChange={setCardHolder}
                                        disabled={!canManageSettings}
                                    />
                                    <Field
                                        label="Expiry (YYYY-MM)"
                                        value={cardExpiry}
                                        onChange={setCardExpiry}
                                        disabled={!canManageSettings}
                                        placeholder="2027-08"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-[11px] text-slate-500">
                                        Status
                                        <select
                                            className="select ml-2 h-8 text-xs"
                                            value={cardStatus}
                                            onChange={e =>
                                                setCardStatus(e.target.value as 'ACTIVE' | 'BLOCKED')
                                            }
                                            disabled={!canManageSettings}
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="BLOCKED">Blocked</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn-ghost text-red-600 flex items-center gap-1 text-xs disabled:opacity-50"
                                            onClick={handleUnbindCard}
                                            disabled={!canManageSettings}
                                        >
                                            <Trash2 size={14} />
                                            Remove card
                                        </button>
                                        <button
                                            className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                                            onClick={handleBindCard}
                                            disabled={!canManageSettings}
                                        >
                                            <Save size={14} />
                                            Save card
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-xs text-slate-600">
                                No corporate card is linked yet. In real onboarding, card binding is done during
                                first purchase or registration. Here you can simulate binding.
                            </div>
                            <div className="grid md:grid-cols-2 gap-3 text-xs mt-2">
                                <Field
                                    label="Card product / brand"
                                    value={cardBrand}
                                    onChange={setCardBrand}
                                    disabled={!canManageSettings}
                                    placeholder="Visa Business"
                                />
                                <Field
                                    label="Last 4 digits"
                                    value={cardLast4}
                                    onChange={setCardLast4}
                                    disabled={!canManageSettings}
                                    placeholder="4242"
                                />
                                <Field
                                    label="Card holder"
                                    value={cardHolder}
                                    onChange={setCardHolder}
                                    disabled={!canManageSettings}
                                    placeholder="Demo Company LLC"
                                />
                                <Field
                                    label="Expiry (YYYY-MM)"
                                    value={cardExpiry}
                                    onChange={setCardExpiry}
                                    disabled={!canManageSettings}
                                    placeholder="2027-08"
                                />
                            </div>
                            <div className="flex justify-end mt-3">
                                <button
                                    className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                                    onClick={handleBindCard}
                                    disabled={!canManageSettings}
                                >
                                    <CreditCard size={14} />
                                    Bind corporate card (simulate)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* 3. TRAVEL POLICY SETTINGS */}
            <div className="card p-4 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <Shield size={16} className="text-slate-600" />
                        Travel policy settings
                    </h2>
                    {!canManageSettings && (
                        <span className="text-[11px] text-slate-400">
              Read-only in this prototype for non-admin roles
            </span>
                    )}
                </div>

                {/* Summary row */}
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-start gap-2">
                        <Info size={14} className="mt-[2px] text-slate-500" />
                        <div>
                            <div className="font-semibold text-[11px]">How this policy is used</div>
                            <div className="text-[11px] text-slate-600 mt-1">
                                Rules below define OK / WARN / BLOCK flags in flight search and booking. Read-only
                                version is available on Travel Policy page.
                            </div>
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-600">
                        <span className="font-semibold">Price logic</span>
                        <div className="mt-1">
                            OK: below {policySoftLimit.toLocaleString('ru-RU')} KZT
                        </div>
                        <div>
                            WARN: {policySoftLimit.toLocaleString('ru-RU')} –{' '}
                            {policyBlockLimit.toLocaleString('ru-RU')} KZT
                        </div>
                        <div>
                            BLOCK: above {policyBlockLimit.toLocaleString('ru-RU')} KZT
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-600">
                        <span className="font-semibold">Schedule & connections</span>
                        <div className="mt-1">
                            Preferred departure: {policyPreferredFrom}–{policyPreferredTo}
                        </div>
                        <div>
                            Connections: {policyAllowConnections ? 'allowed' : 'forbidden'}
                            {policyAllowConnections && ` (max ${policyMaxConnectionTime} min)`}
                        </div>
                    </div>
                </div>

                {/* Price rules */}
                <div className="border-t border-slate-100 pt-3 mt-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Plane size={16} className="text-slate-600" />
                        <span className="font-semibold">Flight price rules</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                        <Field
                            label="Soft price limit (KZT)"
                            value={policySoftLimit.toString()}
                            onChange={v => setPolicySoftLimit(Number(v) || 0)}
                            disabled={!canManageSettings}
                        />
                        <Field
                            label="Block price limit (KZT)"
                            value={policyBlockLimit.toString()}
                            onChange={v => setPolicyBlockLimit(Number(v) || 0)}
                            disabled={!canManageSettings}
                        />
                        <div className="text-[11px] text-slate-500 flex items-start gap-2">
                            <Info size={14} className="mt-[2px]" />
                            <span>
                Soft limit = WARN threshold. Block limit = red zone, ticket cannot be purchased if
                price is above this value.
              </span>
                        </div>
                    </div>
                </div>

                {/* Time window */}
                <div className="border-t border-slate-100 pt-3 mt-2 space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-slate-600" />
                        <span className="font-semibold">Preferred departure time window</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 text-xs">
                        <Field
                            label="From"
                            type="time"
                            value={policyPreferredFrom}
                            onChange={setPolicyPreferredFrom}
                            disabled={!canManageSettings}
                        />
                        <Field
                            label="To"
                            type="time"
                            value={policyPreferredTo}
                            onChange={setPolicyPreferredTo}
                            disabled={!canManageSettings}
                        />
                        <div className="text-[11px] text-slate-500">
                            Flights outside this window are marked as WARN due to schedule mismatch.
                        </div>
                    </div>
                </div>

                {/* Allowed classes + extra rules */}
                <div className="border-t border-slate-100 pt-3 mt-2 grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Check size={16} className="text-slate-600" />
                            <span className="font-semibold text-sm">Allowed flight classes</span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-xs">
                            {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS'].map(cl => (
                                <label key={cl} className="flex items-center gap-1">
                                    <input
                                        type="checkbox"
                                        checked={policyAllowedClasses.includes(cl)}
                                        onChange={() => togglePolicyClass(cl)}
                                        disabled={!canManageSettings}
                                    />
                                    {cl.replace('_', ' ')}
                                </label>
                            ))}
                        </div>
                        <div className="text-[11px] text-slate-500">
                            If a flight is in a class not checked here, it will be treated as BLOCK.
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Ban size={16} className="text-slate-600" />
                            <span className="font-semibold text-sm">Additional rules</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <ToggleRow
                                label="Allow connecting flights"
                                checked={policyAllowConnections}
                                onChange={setPolicyAllowConnections}
                                disabled={!canManageSettings}
                            />
                            {policyAllowConnections && (
                                <Field
                                    label="Max connection time (minutes)"
                                    value={policyMaxConnectionTime.toString()}
                                    onChange={v => setPolicyMaxConnectionTime(Number(v) || 0)}
                                    disabled={!canManageSettings}
                                />
                            )}
                            <ToggleRow
                                label="Hand baggage only"
                                checked={policyHandBaggageOnly}
                                onChange={setPolicyHandBaggageOnly}
                                disabled={!canManageSettings}
                            />
                        </div>
                        <div className="text-[11px] text-slate-500">
                            These rules are applied in addition to price and time conditions and are reflected in
                            flight badges and tooltips.
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                        onClick={handleSaveTravelPolicy}
                        disabled={!canManageSettings}
                    >
                        <Save size={14} />
                        Save travel policy
                    </button>
                </div>
            </div>

            {/* 4. DEPARTMENTS & COST CENTERS */}
            <div className="card p-4 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <Layers size={16} className="text-slate-600" />
                        Departments & cost centers
                    </h2>
                    {!canManageSettings && (
                        <span className="text-[11px] text-slate-400">Read-only</span>
                    )}
                </div>
                <div className="grid md:grid-cols-2 gap-4 text-xs">
                    <div>
                        <div className="font-semibold text-[11px] mb-1">Departments</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {departments.map(d => (
                                <span
                                    key={d}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200"
                                >
                  {d}
                                    {canManageSettings && (
                                        <button
                                            type="button"
                                            className="text-[10px] text-slate-400"
                                            onClick={() => removeDepartment(d)}
                                        >
                                            ×
                                        </button>
                                    )}
                </span>
                            ))}
                            {departments.length === 0 && (
                                <span className="text-slate-400">No departments configured</span>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                className="input h-8 text-xs"
                                placeholder="Add department"
                                value={newDept}
                                onChange={e => setNewDept(e.target.value)}
                                disabled={!canManageSettings}
                            />
                            <button
                                className="btn-primary h-8 text-[11px] disabled:opacity-50"
                                onClick={addDepartment}
                                disabled={!canManageSettings || !newDept.trim()}
                            >
                                Add
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="font-semibold text-[11px] mb-1">Cost centers</div>
                        <div className="space-y-1 mb-2">
                            {costCenters.map(cc => (
                                <div
                                    key={cc.code}
                                    className="flex items-center justify-between px-2 py-1 rounded border border-slate-200 bg-slate-50"
                                >
                                    <div>
                                        <div className="font-mono text-[11px]">{cc.code}</div>
                                        <div className="text-[11px] text-slate-600">{cc.name}</div>
                                    </div>
                                    {canManageSettings && (
                                        <button
                                            className="btn-ghost text-[11px] text-red-600 h-7 px-2"
                                            onClick={() => removeCostCenter(cc.code)}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            {costCenters.length === 0 && (
                                <div className="text-slate-400 text-xs">No cost centers configured</div>
                            )}
                        </div>
                        <div className="grid grid-cols-[auto,1fr] gap-2">
                            <input
                                className="input h-8 text-xs"
                                placeholder="Code (e.g. CC-020)"
                                value={newCCCode}
                                onChange={e => setNewCCCode(e.target.value)}
                                disabled={!canManageSettings}
                            />
                            <input
                                className="input h-8 text-xs"
                                placeholder="Name"
                                value={newCCName}
                                onChange={e => setNewCCName(e.target.value)}
                                disabled={!canManageSettings}
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                className="btn-primary h-8 text-[11px] disabled:opacity-50"
                                onClick={addCostCenter}
                                disabled={
                                    !canManageSettings || !newCCCode.trim() || !newCCName.trim()
                                }
                            >
                                Add cost center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. DOCUMENTS & INVOICES */}
            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <Globe size={16} className="text-slate-600" />
                        Documents & invoices
                    </h2>
                    {!canManageSettings && (
                        <span className="text-[11px] text-slate-400">
              Read-only for coordinator. Changes available for admin only.
            </span>
                    )}
                </div>

                <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <div>
                        <label className="text-[11px] text-slate-500">Email for documents</label>
                        <input
                            className="input mt-1 h-8"
                            value={docEmail}
                            onChange={e => setDocEmail(e.target.value)}
                            disabled={!canManageSettings}
                        />
                        <div className="text-[10px] text-slate-500 mt-1">
                            All invoices and acts will be sent to this email by default.
                        </div>
                    </div>
                    <div>
                        <label className="text-[11px] text-slate-500">Language of documents</label>
                        <select
                            className="select mt-1 h-8"
                            value={docLanguage}
                            onChange={e => setDocLanguage(e.target.value as 'ru' | 'en')}
                            disabled={!canManageSettings}
                        >
                            <option value="ru">Russian</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div className="flex flex-col justify-between">
                        <label className="text-[11px] text-slate-500">Auto-send documents</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input
                                id="autoSendDocs"
                                type="checkbox"
                                className="h-4 w-4"
                                checked={autoSendDocs}
                                onChange={e => setAutoSendDocs(e.target.checked)}
                                disabled={!canManageSettings}
                            />
                            <label htmlFor="autoSendDocs" className="text-[11px] text-slate-600">
                                Send invoice & act automatically after successful payment
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                        onClick={handleSaveDocsSettings}
                        disabled={!canManageSettings}
                    >
                        <Save size={14} />
                        Save documents settings
                    </button>
                </div>
            </div>

            {/* 6. NOTIFICATIONS & ALERTS */}
            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <Bell size={16} className="text-slate-600" />
                        Notifications & alerts
                    </h2>
                    {!canManageSettings && (
                        <span className="text-[11px] text-slate-400">
              Read-only for coordinator
            </span>
                    )}
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                    <ToggleRow
                        icon={<Mail size={12} className="text-slate-500" />}
                        label="Ticket booked"
                        description="Send email when ticket is successfully booked and issued."
                        checked={notifyTicketBooked}
                        onChange={setNotifyTicketBooked}
                        disabled={!canManageSettings}
                    />
                    <ToggleRow
                        icon={<Shield size={12} className="text-slate-500" />}
                        label="Policy breach"
                        description="Send alert when coordinator books option outside travel policy."
                        checked={notifyPolicyBreach}
                        onChange={setNotifyPolicyBreach}
                        disabled={!canManageSettings}
                    />
                    <ToggleRow
                        icon={<CreditCard size={12} className="text-slate-500" />}
                        label="Postpay due reminders"
                        description="Reminders when postpay invoices are close to due date."
                        checked={notifyPostpayDue}
                        onChange={setNotifyPostpayDue}
                        disabled={!canManageSettings}
                    />
                    <ToggleRow
                        icon={<Settings2 size={12} className="text-slate-500" />}
                        label="Weekly digest"
                        description="Weekly summary with new trips, spend and policy events."
                        checked={notifyWeeklyDigest}
                        onChange={setNotifyWeeklyDigest}
                        disabled={!canManageSettings}
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        className="btn-primary flex items-center gap-1 text-xs disabled:opacity-50"
                        onClick={handleSaveNotifications}
                        disabled={!canManageSettings}
                    >
                        <Save size={14} />
                        Save notifications
                    </button>
                </div>
            </div>

            {/* 7. TARIFF MANAGEMENT */}
            <div className="card p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        <Settings2 size={16} className="text-slate-600" />
                        Tariff management
                    </h2>
                    {!canManageTariff && (
                        <span className="text-[11px] text-slate-400">
              Tariff changes allowed for admin only
            </span>
                    )}
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                    <TariffCard
                        name="FREE"
                        current={company.tariff}
                        title="Free"
                        description="Simple flow, minimum steps, usually personal card or company balance. No SLA support."
                        onSelect={() => handleChangeTariff('FREE')}
                        disabled={!canManageTariff}
                    />
                    <TariffCard
                        name="POSTPAY"
                        current={company.tariff}
                        title="Postpay"
                        description="Deferred payment with limit and due date. Includes support and service fee."
                        onSelect={() => handleChangeTariff('POSTPAY')}
                        disabled={!canManageTariff}
                    />
                    <TariffCard
                        name="FLEX"
                        current={company.tariff}
                        title="Flex / VIP"
                        description="Flexible changes, priority support, API integration. Best for heavy corporate usage."
                        onSelect={() => handleChangeTariff('FLEX')}
                        disabled={!canManageTariff}
                    />
                </div>
            </div>
        </div>
    )
}

/* ==== SMALL COMPONENTS ==== */

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
            <input
                type={type}
                className="input h-8 text-xs mt-1"
                value={value}
                onChange={e => onChange(e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
            />
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
                <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={checked}
                    onChange={e => onChange(e.target.checked)}
                    disabled={disabled}
                />
            </div>
            <div className="space-y-1">
                <div className="flex items-center gap-1">
                    {icon}
                    <span className="font-semibold text-[11px]">{label}</span>
                </div>
                {description && (
                    <div className="text-[11px] text-slate-600">{description}</div>
                )}
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
                active
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
            } disabled:opacity-50`}
            onClick={onSelect}
            disabled={disabled}
        >
            <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{title}</span>
                {active && (
                    <span className="badge-soft text-[10px] border border-sky-300 bg-sky-50">
            current
          </span>
                )}
            </div>
            <div className="text-[11px] text-slate-600">{description}</div>
        </button>
    )
}