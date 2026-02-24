import { useState } from 'react'
import { toast } from 'sonner'

interface UseInstantMutationOptions<T> {
  onSuccess?: () => void
  successMessage?: string
  errorMessage?: string
}

export function useInstantMutation<T>(
  options: UseInstantMutationOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false)

  const mutate = async (
    fn: () => Promise<Response>,
    optimisticUpdate?: () => void,
    rollback?: () => void
  ) => {
    // Execute optimistic update immediately
    if (optimisticUpdate) {
      optimisticUpdate()
    }

    setIsLoading(true)

    try {
      const response = await fn()

      if (!response.ok) {
        throw new Error('Request failed')
      }

      // Show success message
      if (options.successMessage) {
        toast.success(options.successMessage)
      }

      // Call onSuccess callback
      if (options.onSuccess) {
        options.onSuccess()
      }
    } catch (error) {
      console.error('Mutation error:', error)

      // Rollback on error
      if (rollback) {
        rollback()
      }

      // Show error message
      if (options.errorMessage) {
        toast.error(options.errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading }
}
