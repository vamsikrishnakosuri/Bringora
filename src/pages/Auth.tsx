import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react'

export default function Auth() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const { t } = useLanguage()

  const [isSignUp, setIsSignUp] = useState(false)
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const redirect = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (user) {
      navigate(redirect)
    }
  }, [user, navigate, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isResetPassword) {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setResetSent(true)
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) {
          setError(error.message)
        } else {
          setSignUpSuccess(true)
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(
        err.message || 
        'Google sign-in is not enabled. Please enable it in your Supabase dashboard under Authentication > Providers > Google.'
      )
    }
  }

  if (resetSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] px-4">
        <Card className="max-w-md w-full backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">{t('auth.resetPassword')}</h2>
          <p className="text-muted dark:text-gray-400 mb-6">
            Check your email for password reset instructions.
          </p>
          <Button onClick={() => setIsResetPassword(false)} className="w-full">
            Back to Sign In
          </Button>
        </Card>
      </div>
    )
  }

  if (signUpSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] px-4">
        <Card className="max-w-md w-full backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10 text-center">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Account Created!</h2>
          <p className="text-muted dark:text-gray-400 mb-6">
            Please check your email to confirm your account. Once confirmed, you can sign in.
          </p>
          <Button 
            onClick={() => {
              setSignUpSuccess(false)
              setIsSignUp(false)
            }} 
            className="w-full"
          >
            Back to Sign In
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-white dark:from-[#0A0A0A] dark:via-[#0F0F0F] dark:to-[#0A0A0A] px-4">
      <Card className="max-w-md w-full backdrop-blur-xl bg-white/80 dark:bg-[#1A1A1A]/80 border-white/20 dark:border-white/10">
        {/* Uber-style unified header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tight dark:text-white">Welcome</h1>
          <p className="text-muted dark:text-gray-400">
            {isResetPassword 
              ? 'Reset your password' 
              : isSignUp 
              ? 'Create your account' 
              : 'Sign in to continue'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/30 dark:border dark:border-red-800/50 text-red-600 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
                autoFocus
              />
            </div>
          </div>

          {!isResetPassword && (
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-gray-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {!isSignUp && !isResetPassword && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-muted dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2 h-12 text-base font-semibold"
            disabled={loading}
          >
            {loading ? (
              'Loading...'
            ) : isResetPassword ? (
              'Send Reset Link'
            ) : isSignUp ? (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                Sign In
                <LogIn className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {!isResetPassword && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-border dark:border-white/10"></div>
              <span className="px-4 text-sm text-muted dark:text-gray-400">OR</span>
              <div className="flex-1 border-t border-border dark:border-white/10"></div>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </>
        )}

        <div className="mt-6 text-center">
          {isResetPassword ? (
            <button
              onClick={() => setIsResetPassword(false)}
              className="text-sm text-muted dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors"
            >
              ← Back to Sign In
            </button>
          ) : (
            <p className="text-sm text-muted dark:text-gray-400">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setEmail('')
                  setPassword('')
                }}
                className="font-semibold text-foreground dark:text-white hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
