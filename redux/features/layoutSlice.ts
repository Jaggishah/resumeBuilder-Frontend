import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Define a type for the slice state
export interface layoutState {
  value: number
}

// Define the initial state using that type
const initialState: layoutState = {
  value: 0
}

export const layoutSlice = createSlice({
  name: 'layout',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    increment: state => {
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = layoutSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectLayout = (state: RootState) => state.layout.value

export default layoutSlice.reducer