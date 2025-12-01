import React, { useState } from 'react'
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
import BusinessTrips from './pages/BusinessTrips'
import NotFoundPage from './pages/NotFoundPage'
import EmployeesPage from './pages/EmployeesPage'
import AnalyticsPage from './pages/AnalyticsPage.tsx'
import CompanySettingsPage from './pages/CompanySettingsPage'
import EmployeeProfilePage from './pages/EmployeeProfilePage'
import CompanySignupPage from './pages/CompanySignupPage'
import { AiAssistantWidget } from './components/AiAssistantWidget'
import CommandPalette from './components/CommandPalette.tsx'
import { QuickActionFloatingButton } from './components/QuickActionFloatingButton.tsx'
import { HotkeysProvider } from './components/HotkeysProvider.tsx'
import { GlobalShortcutsProvider } from './components/GlobalShortcutsProvider.tsx'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'
import PenaltiesPage from './pages/PenaltiesPage.tsx'
import BusinessTripsPage from './pages/BusinessTrip.tsx'

function Protected({ children }: { children: React.ReactNode }) {
   const { user } = useStore()
   if (!user) return <Navigate to="/login" replace />
   return <>{children}</>
}

function AppInner() {
   const { user } = useStore()
   const [quickOpen, setQuickOpen] = useState(false)
   const [shortcutsOpen, setShortcutsOpen] = useState(false)

   const location = useLocation()

   const isPublic = location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')

   const toggleQuickActions = (force?: boolean) => {
      if (typeof force === 'boolean') {
         setQuickOpen(force)
      } else {
         setQuickOpen(o => !o)
      }
   }
   return (
      <>
         <HotkeysProvider toggleQuickActions={toggleQuickActions} />

         <Layout>
            <Routes>
               <Route path="/" element={<Navigate to="/dashboard" replace />} />
               <Route path="/login" element={<LoginPage />} />

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
                  path="/business-trips"
                  element={
                     <Protected>
                        <BusinessTrips />
                     </Protected>
                  }
               />
               <Route path="/business-trips/:id" element={<BusinessTripsPage />} />
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
                  path="/analytics"
                  element={
                     <Protected>
                        <AnalyticsPage />
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
               <Route
                  path="/penaltes"
                  element={
                     <Protected>
                        <PenaltiesPage />
                     </Protected>
                  }
               />

               <Route path="/signup/company" element={<CompanySignupPage />} />

               <Route path="*" element={<NotFoundPage />} />
            </Routes>
            {user && !isPublic && (
               <>
                  <AiAssistantWidget />
               </>
            )}
            {user && (
               <>
                  <CommandPalette />
                  <GlobalShortcutsProvider onToggleHelp={() => setShortcutsOpen(o => !o)} />
                  <QuickActionFloatingButton open={quickOpen} setOpen={setQuickOpen} />
                  <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
               </>
            )}
         </Layout>
      </>
   )
}

export default function App() {
   return (
      <StoreProvider>
         <AppInner />
      </StoreProvider>
   )
}
