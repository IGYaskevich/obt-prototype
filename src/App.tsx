import React from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import Layout from './components/Layout'
import {StoreProvider, useStore} from './state/store'

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
import ReportsPage from "./pages/ReportsPage.tsx";
import CompanySettingsPage from "./pages/CompanySettingsPage.tsx";
import EmployeeProfilePage from "./pages/EmployeeProfilePage.tsx";

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useStore()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <StoreProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/search" element={<Protected><SearchPage /></Protected>} />
          <Route path="/search/results" element={<Protected><ResultsPage /></Protected>} />
          <Route path="/ticket/purchase" element={<Protected><TicketPurchasePage /></Protected>} />
          <Route path="/tariffs" element={<Protected><TariffsPage /></Protected>} />
          <Route path="/policies" element={<Protected><PoliciesPage /></Protected>} />
          <Route path="/exchanges" element={<Protected><ExchangesPage /></Protected>} />
          <Route path="/support" element={<Protected><SupportPage /></Protected>} />
          <Route path="/documents" element={<Protected><DocumentsPage /></Protected>} />
            <Route path="employees" element={<EmployeesPage />} />
            {/* профиль конкретного сотрудника */}
            <Route path="employees/:id" element={<EmployeeProfilePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings/company" element={<CompanySettingsPage />} />

            <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </StoreProvider>
  )
}
