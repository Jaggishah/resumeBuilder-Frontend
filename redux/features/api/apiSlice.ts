// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// User interface for authentication
export interface Subscription {
    type: string
    credits_remaining: number
    credits_used: number
    is_unlimited: boolean
    start_date: string
    end_date: string | null
}

export interface User {
    id: string
    email: string
    name: string
    picture?: string
    created_at?: string
    updated_at?: string
    subscription?: Subscription
}

// Google OAuth request payload
export interface GoogleOAuthRequest {
    access_token: string
    id_token?: string
}

// Authentication response
export interface AuthResponse {
    access_token: string
    refresh_token?: string
    user: User
    expires_in?: number
}

// Login request payload
export interface LoginRequest {
    email: string
    password: string
}

// Register request payload  
export interface RegisterRequest {
    email: string
    password: string
    name: string
}


export interface Todo {
    userId: number
    id: number
    title: string
    completed: boolean
}

// Import the RTK Query methods from the React-specific entry point

export interface Todo {
    userId: number
    id: number
    title: string
    completed: boolean
}

// Request payload for the upload endpoint
export interface UploadResumeRequest {
    file: File
}

// Response shape (adjust to match your backend)
export interface UploadResumeResponse {
    id?: string;
    username?: string;
    json_data?: Record<string, any>;
    yaml_content?: string;
    pdf_path?: string;
    created_at?: string;
    updated_at?: string;
    email?: string;
}

// AI Enhancement request payload
export interface EnhanceContentRequest {
    content: string
    section_name: string
    instruction?: string // Optional user instruction
}

// AI Enhancement response
export interface EnhanceContentResponse {
    section: string
    original: string
    enhanced: string
}

// ATS Analysis request payload
export interface ATSAnalysisRequest {
    resume_file?: File
    resume_text?: string
    job_description?: string
    job_url?: string
}

// ATS Analysis response
export interface ATSAnalysisResponse {
    overall_score: number
    compatibility_score: number
    keyword_match_percentage: number
    missing_keywords: string[]
    matched_keywords: string[]
    suggestions: string[]
    section_analysis: {
        [key: string]: {
            score: number
            feedback: string
            suggestions: string[]
        }
    }
    formatting_issues: string[]
    strengths: string[]
}

// Resume save/get models
export interface SaveResumeRequest {
    title?: string | null
    json_data: Record<string, any>
}

export interface ResumeResponse {
    id: string
    title?: string | null
    json_data: Record<string, any>
    created_at: string
    updated_at: string
}

// Feedback submission request payload
export interface FeedbackSubmissionRequest {
    message: string
}

// Feedback submission response
export interface FeedbackSubmissionResponse {
    feedback_id?: string
    message: string
    status: string
}

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
        prepareHeaders: (headers, { getState }) => {
            // Add auth token to requests if user is authenticated
            const token = (getState() as any).auth.access_token
            if (token) {
                headers.set('authorization', `Bearer ${token}`)
            }
            return headers
        }
    }),
    endpoints: builder => ({
        getTodo: builder.query<Todo, number>({
            query: (id = 1) => `/todos/${id}`
        }),
        uploadResume: builder.mutation<UploadResumeResponse, UploadResumeRequest>({
            query: ({  file }) => {
                const form = new FormData()
                // Only append the file in the form data
                form.append('file', file)
                return {
                    url: `/api/resumes/upload`,
                    method: 'POST',
                    body: form,
                }
            }
        }),
        enhanceContent: builder.mutation<EnhanceContentResponse, EnhanceContentRequest>({
            query: ({ content, section_name, instruction }) => ({
                url: '/api/ai/enhance',
                method: 'POST',
                body: { 
                    content, 
                    section_name,
                    ...(instruction && { instruction })
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        analyzeATS: builder.mutation<ATSAnalysisResponse, ATSAnalysisRequest>({
            query: ({ resume_file, resume_text, job_description, job_url }) => {
                const formData = new FormData()
                
                // Add resume data
                if (resume_file) {
                    formData.append('resume_file', resume_file)
                } else if (resume_text) {
                    formData.append('resume_text', resume_text)
                }
                
                // Add job data
                if (job_description) {
                    formData.append('job_description', job_description)
                } else if (job_url) {
                    formData.append('job_url', job_url)
                }
                
                return {
                    url: '/api/ats/analyze',
                    method: 'POST',
                    body: formData,
                }
            }
        }),
        // Authentication endpoints
        googleOAuth: builder.mutation<AuthResponse, GoogleOAuthRequest>({
            query: ({ access_token, id_token }) => ({
                url: '/api/auth/google',
                method: 'POST',
                body: { 
                    access_token,
                    ...(id_token && { id_token })
                },
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: ({ email, password }) => ({
                url: '/api/auth/login',
                method: 'POST',
                body: { email, password },
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: ({ email, password, name }) => ({
                url: '/api/auth/register',
                method: 'POST',
                body: { email, password, name },
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        logout: builder.mutation<{ message: string }, void>({
            query: () => ({
                url: '/api/auth/logout',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        refreshToken: builder.mutation<AuthResponse, { refresh_token: string }>({
            query: ({ refresh_token }) => ({
                url: '/api/auth/refresh',
                method: 'POST',
                body: { refresh_token },
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        getProfile: builder.query<User, void>({
            query: () => ({
                url: '/api/auth/profile',
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        }),
        // Get all resumes for the current user
        getMyResumes: builder.query<ResumeResponse[], void>({
            query: () => ({
                url: '/api/resumes/my-resumes',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
        }),
        // Save a resume (create or update depending on backend behavior)
        saveResume: builder.mutation<ResumeResponse, SaveResumeRequest>({
            query: (body) => ({
                url: '/api/resumes/save',
                method: 'POST',
                body,
                headers: { 'Content-Type': 'application/json' }
            })
        }),
        // Submit feedback
        submitFeedback: builder.mutation<FeedbackSubmissionResponse, FeedbackSubmissionRequest>({
            query: ({ message }) => ({
                url: '/api/feedback/submit',
                method: 'POST',
                body: { message },
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        })
    })
})

export const { 
    useGetTodoQuery, 
    useUploadResumeMutation, 
    useEnhanceContentMutation, 
    useAnalyzeATSMutation,
    useGoogleOAuthMutation,
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useRefreshTokenMutation,
    useGetProfileQuery,
    useGetMyResumesQuery,
    useSaveResumeMutation,
    useSubmitFeedbackMutation
} = apiSlice
