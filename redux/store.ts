import { configureStore } from '@reduxjs/toolkit'
import layoutReducer from './features/layoutSlice'
import resumeReducer from './features/resumeSlice'
import authReducer from './features/authSlice'
import { apiSlice } from './features/api/apiSlice'

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    resume: resumeReducer,
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(apiSlice.middleware)
})

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store