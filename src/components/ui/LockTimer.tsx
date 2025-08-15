'use client'

import { useEffect, useState } from 'react'

interface LockTimerProps {
  expiresAt: string
  onExpired: () => void
  onExtend?: () => void
}

export default function LockTimer({ expiresAt, onExpired, onExtend }: LockTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const difference = expiry - now

      if (difference <= 0) {
        setTimeLeft(0)
        if (!isExpired) {
          setIsExpired(true)
          onExpired()
        }
        return
      }

      setTimeLeft(difference)
      setIsExpired(false)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpired, isExpired])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const isLowTime = timeLeft <= 120000 // 2 minutes or less

  if (isExpired) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Booking Session Expired</h3>
            <p className="text-red-700 text-sm">Your booking session has expired. Please start over.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${isLowTime ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <svg className={`h-5 w-5 mr-3 ${isLowTime ? 'text-yellow-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className={`font-medium ${isLowTime ? 'text-yellow-800' : 'text-blue-800'}`}>
              {isLowTime ? 'Hurry! Time running out' : 'Room Reserved'}
            </h3>
            <p className={`text-sm ${isLowTime ? 'text-yellow-700' : 'text-blue-700'}`}>
              Time remaining: <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </p>
          </div>
        </div>
        
        {onExtend && timeLeft <= 300000 && ( // Show extend button when 5 minutes or less
          <button
            onClick={onExtend}
            className="px-3 py-1 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 transition-colors"
          >
            Extend Time
          </button>
        )}
      </div>
      
      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-1000 ${
              isLowTime ? 'bg-yellow-400' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.max(0, (timeLeft / (10 * 60 * 1000)) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}