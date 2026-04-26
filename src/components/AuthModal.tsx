"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { signIn } from 'next-auth/react'

type PropsType = {
  open: boolean
  onClose: () => void
}

type AuthStep = 'login' | 'signup' | 'otp'

import { toast } from 'react-hot-toast'

const AuthModal = ({ open, onClose }: PropsType) => {
  const [step, setStep] = useState<AuthStep>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [otp, setOtp] = useState(['', '', '', ''])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  if (!open) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    setError(null)

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (res?.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Welcome back!')
        onClose()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.message || data.error || 'Signup failed'
        setError(msg)
        toast.error(msg)
      } else {
        toast.success('Registration successful! Check your email.')
        setStep('otp')
      }
    } catch (err) {
      setError('Connection error. Please try again.')
      toast.error('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('')
    if (otpCode.length < 4) {
      setError('Please enter the full 4-digit code')
      toast.error('Incomplete code')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode }),
      })

      const data = await res.json()

      if (!res.ok) {
        const msg = data.error || 'Verification failed'
        setError(msg)
        toast.error(msg)
      } else {
        setStep('login')
        setFormData({ ...formData, password: '' })
        setError(null)
        toast.success('Email verified successfully! Please sign in.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = () => {
    signIn('google', { callbackUrl: '/' })
  }


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 'login' && (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
                  <p className="mt-2 text-gray-400">Login to your RideFlow account</p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white cursor-pointer transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Sign In <ArrowRight size={18} /></>}
                </button>

                <div className="relative flex items-center justify-center gap-4 py-2">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs font-medium text-gray-500 uppercase">Or continue with</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 font-semibold text-white cursor-pointer transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" className="fill-blue-400" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" className="fill-green-400" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" className="fill-yellow-400" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" className="fill-red-400" />
                  </svg>
                  Google
                </button>

                <p className="text-center text-sm text-gray-400">
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setStep('signup')} className="cursor-pointer font-bold text-blue-400 hover:text-blue-300">
                    Sign Up
                  </button>
                </p>
              </motion.form>
            )}

            {step === 'signup' && (
              <motion.form
                key="signup"
                onSubmit={handleSignup}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">Create Account</h2>
                  <p className="mt-2 text-gray-400">Join the future of mobility</p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white cursor-pointer transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button type="button" onClick={() => setStep('login')} className="cursor-pointer font-bold text-blue-400 hover:text-blue-300">
                    Login
                  </button>
                </p>
              </motion.form>
            )}

            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white">Verify Email</h2>
                  <p className="mt-2 text-gray-400">We've sent a code to {formData.email}</p>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 text-center text-2xl font-bold text-white focus:border-blue-500 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                <button 
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white cursor-pointer transition-all shadow-lg shadow-blue-600/20 flex justify-center items-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Verify & Continue'}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Didn't receive the code?{' '}
                  <button type="button" className="cursor-pointer font-bold text-blue-400 hover:text-blue-300">
                    Resend
                  </button>
                </p>

                <button type="button" onClick={() => setStep('login')} className="w-full text-sm text-gray-500 hover:text-white transition-colors cursor-pointer">
                  Back to Login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}


export default AuthModal