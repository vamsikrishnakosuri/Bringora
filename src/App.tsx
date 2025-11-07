import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import Header from './components/Header'
import Home from './pages/Home'
import Auth from './pages/Auth'
import AuthCallback from './pages/AuthCallback'
import RequestHelp from './pages/RequestHelp'
import OfferHelp from './pages/OfferHelp'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-background dark:bg-background-dark">
              <Header />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/request-help" element={<RequestHelp />} />
                <Route path="/offer-help" element={<OfferHelp />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </div>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

