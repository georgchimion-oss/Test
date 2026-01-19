import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import { PowerProvider } from './PowerProvider'
import { Toaster } from "@/components/ui/toaster"
import { Toaster as Sonner } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  syncDataverseData,
} from './data/dataLayer'
import Login from './screens/Login'
import Dashboard from './screens/Dashboard'
import DashboardEnhanced from './screens/DashboardEnhanced'
import Kanban from './screens/Kanban'
import Gantt from './screens/Gantt'
import Deliverables from './screens/Deliverables'
import Staff from './screens/Staff'
import Workstreams from './screens/Workstreams'
import PTORequests from './screens/PTORequests'
import HoursTracking from './screens/HoursTracking'
import OrgChartHierarchy from './screens/OrgChartHierarchy'
import OrgChartWorkstream from './screens/OrgChartWorkstream'
import AdminAnalytics from './screens/AdminAnalytics'
import ProjectOverview from './screens/ProjectOverview'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AppRoutes() {
  const { currentUser } = useAuth()

  useEffect(() => {
    const keysToClear = [
      'gov_staff',
      'gov_workstreams',
      'gov_deliverables',
      'gov_pto',
      'gov_hours',
      'gov_seed_source',
      'gov_audit_logs',
    ]
    keysToClear.forEach((key) => localStorage.removeItem(key))
    void syncDataverseData()
  }, [])

  if (!currentUser) {
    return <Login />
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProjectOverview />
        }
      />
      <Route
        path="/my-work"
        element={
          <Layout title="My Work">
            <DashboardEnhanced />
          </Layout>
        }
      />
      <Route
        path="/dashboard-old"
        element={
          <Layout title="My Work (Old)">
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/kanban"
        element={
          <Layout title="Kanban Board">
            <Kanban />
          </Layout>
        }
      />
      <Route
        path="/gantt"
        element={
          <Layout title="Gantt Chart">
            <Gantt />
          </Layout>
        }
      />
      <Route
        path="/deliverables"
        element={
          <Layout title="Deliverables">
            <Deliverables />
          </Layout>
        }
      />
      <Route
        path="/staff"
        element={
          <Layout title="Staff Management">
            <Staff />
          </Layout>
        }
      />
      <Route
        path="/workstreams"
        element={
          <Layout title="Workstreams">
            <Workstreams />
          </Layout>
        }
      />
      <Route
        path="/pto"
        element={
          <Layout title="PTO Requests">
            <PTORequests />
          </Layout>
        }
      />
      <Route
        path="/hours"
        element={
          <Layout title="Hours Tracking">
            <HoursTracking />
          </Layout>
        }
      />
      <Route
        path="/org-chart-hierarchy"
        element={
          <Layout title="Org Chart - Hierarchy">
            <OrgChartHierarchy />
          </Layout>
        }
      />
      <Route
        path="/org-chart-workstream"
        element={
          <Layout title="Org Chart - Workstream">
            <OrgChartWorkstream />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout title="Admin Analytics">
            <AdminAnalytics />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <PowerProvider>
            <BrowserRouter>
              <AuthProvider>
                <AppRoutes />
                <Toaster />
                <Sonner />
              </AuthProvider>
            </BrowserRouter>
          </PowerProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}
