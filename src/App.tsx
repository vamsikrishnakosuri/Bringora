import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Header from './components/Header'
import Home from './pages/Home'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import RequestHelp from './pages/RequestHelp'
import OfferHelp from './pages/OfferHelp'
import MyRequests from './pages/MyRequests'
import BrowseRequests from './pages/BrowseRequests'
import Onboarding from './pages/Onboarding'
import AdminDashboard from './pages/AdminDashboard'
import ProfileCheck from './components/ProfileCheck'
import { useEffect } from 'react'

function AppContent() {
  const location = useLocation()

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/request-help" element={<ProfileCheck><RequestHelp /></ProfileCheck>} />
        <Route path="/offer-help" element={<ProfileCheck><OfferHelp /></ProfileCheck>} />
        <Route path="/my-requests" element={<ProfileCheck><MyRequests /></ProfileCheck>} />
        <Route path="/browse-requests" element={<ProfileCheck><BrowseRequests /></ProfileCheck>} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

