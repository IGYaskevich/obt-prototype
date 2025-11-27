import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { useStore } from '../state/store'
import { Shield, Wallet, Building2, Cog, Bell, CreditCard, Globe, PlugZap } from 'lucide-react'

export default function CompanySettingsPage() {
    const { company, setTariff } = useStore()

    // Mock local state (в реальном продукте будет API)
    const [profile, setProfile] = useState({
        name: "Demo Company LLC",
        bin: "123456789012",
        address: "Almaty, Kazakhstan",
        email: "finance@demo.com",
    })

    const [docSettings, setDocSettings] = useState({
        emailForDocs: "finance@demo.com",
        autoSend: true,
        language: "en",
    })

    const [paymentMethods, setPaymentMethods] = useState({
        balance: true,
        corpCard: true,
        personalCard: true,
    })

    const [notifications, setNotifications] = useState({
        docsExpiring: true,
        policyViolations: true,
        approvals: true,
        postpay: true,
    })

    const [departments] = useState([
        { id: "D1", name: "Finance", manager: "Ignat Admin" },
        { id: "D2", name: "Operations", manager: "Mariya Booker" },
        { id: "D3", name: "Sales", manager: "Alex Viewer" },
    ])

    const [apiKey] = useState("sk_demo_XXXXXXXXXXXXXXXXX")

    return (
        <div className="space-y-8">
            <SectionHeader
                title="Company Settings"
                subtitle="Manage your company profile, payment methods, policies, limits and integrations"
            />

            {/* 1. Company profile */}
            <Card title="Company Profile" icon={Building2}>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <Field label="Company name" value={profile.name} onChange={(v: any) => setProfile({ ...profile, name: v })} />
                    <Field label="BIN / Tax ID" value={profile.bin} onChange={(v: any) => setProfile({ ...profile, bin: v })} />
                    <Field label="Address" value={profile.address} onChange={(v: any) => setProfile({ ...profile, address: v })} />
                    <Field label="Email for communication" value={profile.email} onChange={(v: any) => setProfile({ ...profile, email: v })} />
                </div>
            </Card>

            {/* 2. Payment methods */}
            <Card title="Payment Methods" icon={Wallet}>
                <Toggle
                    label="Company balance"
                    checked={paymentMethods.balance}
                    onChange={(v: any) => setPaymentMethods({ ...paymentMethods, balance: v })}
                />
                <Toggle
                    label="Corporate card"
                    checked={paymentMethods.corpCard}
                    onChange={(v: any) => setPaymentMethods({ ...paymentMethods, corpCard: v })}
                />
                <Toggle
                    label="Personal card (no documents)"
                    checked={paymentMethods.personalCard}
                    onChange={(v: any) => setPaymentMethods({ ...paymentMethods, personalCard: v })}
                />
            </Card>

            {/* 3. Postpay (если тариф поддерживает) */}
            {(company?.tariff === 'POSTPAY' || company?.tariff === 'FLEX') && (
                <Card title="Postpay & Billing" icon={CreditCard}>
                    <div className="text-sm">
                        <div>
                            <b>Postpay limit:</b> {company.postpayLimit.toLocaleString()} ₸
                        </div>
                        <div>
                            <b>Due days for payment:</b> {company.postpayDueDays} days
                        </div>
                        <div className="mt-4 text-xs text-slate-500">
                            Your company must pay invoices within {company.postpayDueDays} days after purchase.
                        </div>
                    </div>
                </Card>
            )}

            {/* 4. Travel Policy */}
            <Card title="Travel Policy (Summary)" icon={Shield}>
                <p className="text-sm text-slate-600">
                    Your company uses unified travel policy with limits on flights, hotels, and approval workflow.
                    To edit full policy, open the Policies page.
                </p>
                <button className="btn-secondary mt-3" onClick={() => window.location.href = "/policies"}>
                    Open Policies
                </button>
            </Card>

            {/* 5. Departments */}
            <Card title="Departments & Cost Centers" icon={Cog}>
                <table className="text-sm w-full border-collapse">
                    <thead className="text-xs text-slate-500 bg-slate-50">
                    <tr>
                        <th className="px-2 py-1 text-left">Department</th>
                        <th className="px-2 py-1 text-left">Manager</th>
                    </tr>
                    </thead>
                    <tbody>
                    {departments.map(d => (
                        <tr key={d.id} className="border-t border-slate-100">
                            <td className="px-2 py-1">{d.name}</td>
                            <td className="px-2 py-1">{d.manager}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </Card>

            {/* 6. Documents settings */}
            <Card title="Documents & Invoices" icon={Globe}>
                <Field
                    label="Email for sending documents"
                    value={docSettings.emailForDocs}
                    onChange={(v: any) => setDocSettings({ ...docSettings, emailForDocs: v })}
                />

                <div className="mt-3">
                    <Toggle
                        label="Auto-send documents after purchase"
                        checked={docSettings.autoSend}
                        onChange={(v: any) => setDocSettings({ ...docSettings, autoSend: v })}
                    />
                </div>

                <div className="mt-3">
                    <label className="text-xs text-slate-500">Document language</label>
                    <select
                        className="select mt-1"
                        value={docSettings.language}
                        onChange={e => setDocSettings({ ...docSettings, language: e.target.value })}
                    >
                        <option value="en">English</option>
                        <option value="ru">Russian</option>
                    </select>
                </div>
            </Card>

            {/* 7. Integrations */}
            {company?.tariff === 'FLEX' && (
                <Card title="Integrations (API / Webhooks)" icon={PlugZap}>
                    <div className="text-sm">
                        <div>
                            <b>API Key:</b>
                        </div>
                        <div className="mt-1 p-2 bg-slate-100 rounded text-xs font-mono select-all">
                            {apiKey}
                        </div>
                        <button className="btn-secondary mt-3">Generate new API key</button>
                    </div>
                </Card>
            )}

            {/* 8. Notifications */}
            <Card title="Notifications & Alerts" icon={Bell}>
                <Toggle
                    label="Document expiration warnings"
                    checked={notifications.docsExpiring}
                    onChange={(v: any) => setNotifications({ ...notifications, docsExpiring: v })}
                />
                <Toggle
                    label="Policy violations"
                    checked={notifications.policyViolations}
                    onChange={(v: any) => setNotifications({ ...notifications, policyViolations: v })}
                />
                <Toggle
                    label="Approvals required"
                    checked={notifications.approvals}
                    onChange={(v: any) => setNotifications({ ...notifications, approvals: v })}
                />
                <Toggle
                    label="Postpay payment reminders"
                    checked={notifications.postpay}
                    onChange={(v: any) => setNotifications({ ...notifications, postpay: v })}
                />
            </Card>

            {/* 9. Tariff management */}
            <Card title="Tariff Management" icon={Cog}>
                <div className="text-sm">
                    <div>
                        Current tariff: <b>{company?.tariff}</b>
                    </div>

                    <button
                        className="btn-primary mt-3"
                        onClick={() => setTariff(company?.tariff === "FREE" ? "POSTPAY" : "FLEX")}
                    >
                        Switch tariff
                    </button>
                </div>
            </Card>
        </div>
    )
}

/* --- Reusable Components --- */

function Card({ title, icon: Icon, children }: any) {
    return (
        <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <Icon size={18} className="text-slate-600" />
                <h2 className="font-semibold">{title}</h2>
            </div>
            {children}
        </div>
    )
}

function Field({ label, value, onChange }: any) {
    return (
        <div>
            <label className="text-xs text-slate-500">{label}</label>
            <input
                className="input mt-1"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}

function Toggle({ label, checked, onChange }: any) {
    return (
        <label className="flex items-center justify-between py-1 cursor-pointer text-sm">
            {label}
            <input
                type="checkbox"
                className="toggle"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
            />
        </label>
    )
}