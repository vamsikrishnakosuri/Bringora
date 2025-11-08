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
import TermsAndConditions from './pages/TermsAndConditions'
import Profile from './pages/Profile'
import ProfileCheck from './components/ProfileCheck'
import { ToastProvider } from './components/ui/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import InstallPrompt from './components/InstallPrompt'
import { useEffect } from 'react'

function AppContent() {
  const location = useLocation()

  useEffect(() => {
    // Smooth scroll to top on route change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {/* Skip to main content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main-content">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/request-help" element={<ProfileCheck><RequestHelp /></ProfileCheck>} />
        <Route path="/offer-help" element={<ProfileCheck><OfferHelp /></ProfileCheck>} />
        <Route path="/my-requests" element={<ProfileCheck><MyRequests /></ProfileCheck>} />
        <Route path="/browse-requests" element={<ProfileCheck><BrowseRequests /></ProfileCheck>} />
        <Route path="/profile" element={<ProfileCheck><Profile /></ProfileCheck>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        </Routes>
        <InstallPrompt />
      </main>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

export default App

