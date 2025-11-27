import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import { StoreProvider, useStore } from './state/store'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SearchPage from './pages/SearchPage'
import ResultsPage from './pages/ResultsPage'
import TicketPurchasePage from './pages/TicketPurchasePage'
import TariffsPage from './pages/TariffsPage'
import PoliciesPage from './pages/PoliciesPage'
import ExchangesPage from './pages/ExchangesPage'
import SupportPage from './pages/SupportPage'
import DocumentsPage from './pages/DocumentsPage'
import NotFoundPage from './pages/NotFoundPage'
import EmployeesPage from './pages/EmployeesPage'
import ReportsPage from './pages/ReportsPage'
import CompanySettingsPage from './pages/CompanySettingsPage'
import EmployeeProfilePage from './pages/EmployeeProfilePage'
import CompanySignupPage from './pages/CompanySignupPage'
import { AiAssistantWidget } from './components/AiAssistantWidget'

/**
 * HOC для приватных роутов
 */
function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

/**
 * Внешний App: только провайдер.
 * Внутри него уже можно безопасно вызывать useStore().
 */
export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  )
}

/**
 * Внутренний слой с Layout, Routes и AI-виджетом.
 */
function AppShell() {
  const { user } = useStore()
  const location = useLocation()

  // публичные страницы (без ассистента)
  const isPublic = location.pathname === '/login' || location.pathname.startsWith('/signup')

  return (
    <Layout>
      <Routes>
        {/* редирект с корня: если не залогинен, Protected всё равно отправит на /login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup/company" element={<CompanySignupPage />} />

        {/* PRIVATE */}
        <Route
          path="/dashboard"
          element={
            <Protected>
              <DashboardPage />
            </Protected>
          }
        />

        <Route
          path="/search"
          element={
            <Protected>
              <SearchPage />
            </Protected>
          }
        />

        <Route
          path="/search/results"
          element={
            <Protected>
              <ResultsPage />
            </Protected>
          }
        />

        <Route
          path="/ticket/purchase"
          element={
            <Protected>
              <TicketPurchasePage />
            </Protected>
          }
        />

        <Route
          path="/tariffs"
          element={
            <Protected>
              <TariffsPage />
            </Protected>
          }
        />

        <Route
          path="/policies"
          element={
            <Protected>
              <PoliciesPage />
            </Protected>
          }
        />

        <Route
          path="/exchanges"
          element={
            <Protected>
              <ExchangesPage />
            </Protected>
          }
        />

        <Route
          path="/support"
          element={
            <Protected>
              <SupportPage />
            </Protected>
          }
        />

        <Route
          path="/documents"
          element={
            <Protected>
              <DocumentsPage />
            </Protected>
          }
        />

        <Route
          path="/employees"
          element={
            <Protected>
              <EmployeesPage />
            </Protected>
          }
        />

        <Route
          path="/employees/:id"
          element={
            <Protected>
              <EmployeeProfilePage />
            </Protected>
          }
        />

        <Route
          path="/reports"
          element={
            <Protected>
              <ReportsPage />
            </Protected>
          }
        />

        <Route
          path="/settings/company"
          element={
            <Protected>
              <CompanySettingsPage />
            </Protected>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* AI-ассистент:
          - виден только после авторизации (user)
          - не показывается на /login и /signup/... */}
      {user && !isPublic && <AiAssistantWidget />}
    </Layout>
  )
}
