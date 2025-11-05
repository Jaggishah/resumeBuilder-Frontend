import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from './api/apiSlice'

interface AuthState {
    user: User | null
    access_token: string | null
    refresh_token: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

// Helper functions to safely access localStorage for SSR compatibility
const getStorageItem = (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key)
    }
    return null
}

const setStorageItem = (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value)
    }
}

const removeStorageItem = (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key)
    }
}

const initialState: AuthState = {
    user: null,
    access_token: getStorageItem('access_token'),
    refresh_token: getStorageItem('refresh_token'),
    isAuthenticated: !!getStorageItem('access_token'),
    isLoading: false
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; access_token: string; refresh_token?: string }>) => {
            state.isLoading = false
            state.user = action.payload.user
            state.access_token = action.payload.access_token
            state.refresh_token = action.payload.refresh_token || null
            state.isAuthenticated = true
            
            // Store tokens in localStorage
            setStorageItem('access_token', action.payload.access_token)
            if (action.payload.refresh_token) {
                setStorageItem('refresh_token', action.payload.refresh_token)
            }
        },
        loginFailure: (state) => {
            state.isLoading = false
            state.user = null
            state.access_token = null
            state.refresh_token = null
            state.isAuthenticated = false
            
            // Clear localStorage
            removeStorageItem('access_token')
            removeStorageItem('refresh_token')
        },
        logout: (state) => {
            state.user = null
            state.access_token = null
            state.refresh_token = null
            state.isAuthenticated = false
            state.isLoading = false
            
            // Clear localStorage
            removeStorageItem('access_token')
            removeStorageItem('refresh_token')
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
        },
        updateTokens: (state, action: PayloadAction<{ access_token: string; refresh_token?: string }>) => {
            state.access_token = action.payload.access_token
            if (action.payload.refresh_token) {
                state.refresh_token = action.payload.refresh_token
            }
            
            // Update localStorage
            setStorageItem('access_token', action.payload.access_token)
            if (action.payload.refresh_token) {
                setStorageItem('refresh_token', action.payload.refresh_token)
            }
        },
        updateSubscription: (state, action: PayloadAction<any>) => {
            if (state.user) {
                state.user.subscription = action.payload
            }
        }
    }
})

export const { 
    loginStart, 
    loginSuccess, 
    loginFailure, 
    logout, 
    setUser, 
    updateTokens

} = authSlice.actions

export default authSlice.reducer