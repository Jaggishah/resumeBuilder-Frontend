import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { User } from './api/apiSlice'

interface AuthState {
    user: User | null
    access_token: string | null
    refresh_token: string | null
    isAuthenticated: boolean
    isLoading: boolean
}

const initialState: AuthState = {
    user: null,
    access_token: localStorage.getItem('access_token'),
    refresh_token: localStorage.getItem('refresh_token'),
    isAuthenticated: !!localStorage.getItem('access_token'),
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
            localStorage.setItem('access_token', action.payload.access_token)
            if (action.payload.refresh_token) {
                localStorage.setItem('refresh_token', action.payload.refresh_token)
            }
        },
        loginFailure: (state) => {
            state.isLoading = false
            state.user = null
            state.access_token = null
            state.refresh_token = null
            state.isAuthenticated = false
            
            // Clear localStorage
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
        },
        logout: (state) => {
            state.user = null
            state.access_token = null
            state.refresh_token = null
            state.isAuthenticated = false
            state.isLoading = false
            
            // Clear localStorage
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
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
            localStorage.setItem('access_token', action.payload.access_token)
            if (action.payload.refresh_token) {
                localStorage.setItem('refresh_token', action.payload.refresh_token)
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