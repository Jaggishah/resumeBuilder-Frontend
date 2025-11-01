import { useEffect, useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { useRefreshTokenMutation } from '../../redux/features/api/apiSlice'
import { updateTokens, logout } from '../../redux/features/authSlice'

interface TokenPayload {
  user_id: string
  email: string
  exp: number
  iat: number
  type: 'access' | 'refresh'
}

export const useTokenRefresh = () => {
  const dispatch = useAppDispatch()
  const { access_token, refresh_token, isAuthenticated } = useAppSelector(state => state.auth)
  const [refreshTokenMutation] = useRefreshTokenMutation()
  const refreshTimeoutRef = useRef<number | null>(null)

  // Decode JWT token to get expiration
  const decodeToken = useCallback((token: string): TokenPayload | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload
    } catch (error) {
      console.error('Failed to decode token:', error)
      return null
    }
  }, [])

  // Check if token is expired or will expire soon
  const isTokenExpiringSoon = useCallback((token: string, bufferMinutes = 5): boolean => {
    const payload = decodeToken(token)
    if (!payload) return true

    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    const bufferTime = bufferMinutes * 60 * 1000 // Convert minutes to milliseconds

    return expirationTime - currentTime <= bufferTime
  }, [decodeToken])

  // Refresh access token using refresh token
  const refreshAccessToken = useCallback(async () => {
    if (!refresh_token) {
      console.log('No refresh token available')
      dispatch(logout())
      return false
    }

    // Check if refresh token itself is expired
    const refreshPayload = decodeToken(refresh_token)
    if (!refreshPayload) {
      console.log('Invalid refresh token')
      dispatch(logout())
      return false
    }

    const refreshExpirationTime = refreshPayload.exp * 1000
    const currentTime = Date.now()

    if (currentTime >= refreshExpirationTime) {
      console.log('Refresh token expired, logging out')
      dispatch(logout())
      return false
    }

    try {
      console.log('Refreshing access token...')
      const result = await refreshTokenMutation({ refresh_token }).unwrap()
      
      dispatch(updateTokens({
        access_token: result.access_token,
        refresh_token: result.refresh_token
      }))

      console.log('Access token refreshed successfully')
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      dispatch(logout())
      return false
    }
  }, [refresh_token, refreshTokenMutation, dispatch, decodeToken])

  // Schedule next token refresh
  const scheduleTokenRefresh = useCallback(() => {
    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current)
    }

    if (!access_token || !isAuthenticated) {
      return
    }

    const payload = decodeToken(access_token)
    if (!payload) {
      dispatch(logout())
      return
    }

    const expirationTime = payload.exp * 1000 // Convert to milliseconds
    const currentTime = Date.now()
    
    // Refresh 5 minutes before expiration (backend tokens expire in 1 hour)
    const refreshTime = expirationTime - currentTime - (5 * 60 * 1000)

    // If token is already expired or expires very soon, refresh immediately
    if (refreshTime <= 0) {
      console.log('Token expired or expiring soon, refreshing immediately')
      refreshAccessToken()
      return
    }

    console.log(`Scheduling token refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`)
    
      refreshTimeoutRef.current = window.setTimeout(() => {
      refreshAccessToken().then((success) => {
        if (success) {
          // Schedule next refresh after successful refresh
          scheduleTokenRefresh()
        }
      })
    }, refreshTime)
  }, [access_token, isAuthenticated, decodeToken, dispatch, refreshAccessToken])

  // Check token on mount and when tokens change
  useEffect(() => {
    if (!isAuthenticated || !access_token) {
      return
    }

    // Check if current access token is expired or expiring soon
    if (isTokenExpiringSoon(access_token)) {
      console.log('Access token is expiring soon, refreshing...')
      refreshAccessToken().then((success) => {
        if (success) {
          scheduleTokenRefresh()
        }
      })
    } else {
      // Schedule refresh for later
      scheduleTokenRefresh()
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [access_token, isAuthenticated, isTokenExpiringSoon, refreshAccessToken, scheduleTokenRefresh])

  // Manual refresh function (can be called manually if needed)
  const manualRefresh = useCallback(async () => {
    return await refreshAccessToken()
  }, [refreshAccessToken])

  // Check if current access token is valid
  const isAccessTokenValid = useCallback(() => {
    if (!access_token) return false
    return !isTokenExpiringSoon(access_token, 0) // Check without buffer
  }, [access_token, isTokenExpiringSoon])

  return {
    refreshAccessToken: manualRefresh,
    isAccessTokenValid
  }
}