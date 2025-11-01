import { useCallback } from 'react'
import { useAppDispatch } from '../../redux/hooks'
import { useGetProfileQuery } from '../../redux/features/api/apiSlice'
import { setUser } from '../../redux/features/authSlice'

export const useSubscriptionUpdate = () => {
  const dispatch = useAppDispatch()
  const { refetch: refetchProfile } = useGetProfileQuery()

  const updateSubscription = useCallback(async () => {
    try {
      const result = await refetchProfile()
      if (result.data) {
        dispatch(setUser(result.data))
      }
    } catch (error) {
      console.error('Failed to update subscription data:', error)
    }
  }, [refetchProfile, dispatch])

  return updateSubscription
}