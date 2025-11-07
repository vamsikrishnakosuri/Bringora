import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { Mail, Lock, ArrowRight } from 'lucide-react'

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
          // Sign up successful - show success message
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
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">{t('auth.resetPassword')}</h2>
          <p className="text-muted dark:text-muted mb-6">
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
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4">
        <Card className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Account Created!</h2>
          <p className="text-muted dark:text-muted mb-6">
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
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark px-4">
      <Card className="max-w-md w-full">
        <h2 className="text-3xl font-bold mb-6 text-center">
          {isResetPassword
            ? t('auth.resetPassword')
            : isSignUp
            ? t('auth.signUp')
            : t('auth.signIn')}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-muted" />
              <Input
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          {!isResetPassword && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted dark:text-muted" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          )}

          {!isSignUp && !isResetPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-muted dark:text-muted hover:text-foreground dark:hover:text-foreground transition-colors"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Loading...' : isResetPassword ? 'Send Reset Link' : isSignUp ? t('auth.signUp') : t('auth.signIn')}
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </form>

        {!isResetPassword && (
          <>
            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-border dark:border-border-dark"></div>
              <span className="px-4 text-sm text-muted dark:text-muted">OR</span>
              <div className="flex-1 border-t border-border dark:border-border-dark"></div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
            >
              {t('auth.signInWithGoogle')}
            </Button>
          </>
        )}

        <div className="mt-6 text-center text-sm">
          {isResetPassword ? (
            <button
              onClick={() => setIsResetPassword(false)}
              className="text-muted dark:text-muted hover:text-foreground dark:hover:text-foreground transition-colors"
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              className="text-muted dark:text-muted hover:text-foreground dark:hover:text-foreground transition-colors"
            >
              {isSignUp ? t('auth.hasAccount') : t('auth.noAccount')}{' '}
              <span className="font-medium">
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </span>
            </button>
          )}
        </div>
      </Card>
    </div>
  )
}

