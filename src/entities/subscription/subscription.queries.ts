import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { subscriptionApi } from './subscription.api'
import type { PlanType } from './subscription.schema'
import type { AddPaymentMethodInput } from './subscription.types'

// Query key factory - Following mapKeys pattern exactly
export const subscriptionKeys = {
  all: ['subscription'] as const,
  current: () => [...subscriptionKeys.all, 'current'] as const,
  usage: () => [...subscriptionKeys.all, 'usage'] as const,
  plans: () => [...subscriptionKeys.all, 'plans'] as const,
  plan: (type: PlanType) => [...subscriptionKeys.plans(), type] as const,
  paymentMethods: () => [...subscriptionKeys.all, 'payment-methods'] as const,
  paymentHistory: () => [...subscriptionKeys.all, 'payment-history'] as const
}

// Query hooks
export const useSubscription = () => {
  return useQuery({
    queryKey: subscriptionKeys.current(),
    queryFn: subscriptionApi.getCurrentSubscription
  })
}

export const useUsageStats = () => {
  return useQuery({
    queryKey: subscriptionKeys.usage(),
    queryFn: subscriptionApi.getUsageStats
  })
}

export const usePlans = () => {
  return useQuery({
    queryKey: subscriptionKeys.plans(),
    queryFn: subscriptionApi.getPlans
  })
}

export const usePlanDetails = (planType: PlanType) => {
  return useQuery({
    queryKey: subscriptionKeys.plan(planType),
    queryFn: () => subscriptionApi.getPlanDetails(planType),
    enabled: !!planType
  })
}

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: subscriptionKeys.paymentMethods(),
    queryFn: subscriptionApi.getPaymentMethods
  })
}

export const usePaymentHistory = () => {
  return useQuery({
    queryKey: subscriptionKeys.paymentHistory(),
    queryFn: subscriptionApi.getPaymentHistory
  })
}

// Mutation hooks - Following map pattern with invalidation
export const useUpdateSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (planType: PlanType) => subscriptionApi.updateSubscription(planType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() })
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.usage() })
    }
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() })
    }
  })
}

export const useResumeSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionApi.resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.current() })
    }
  })
}

export const useAddPaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: AddPaymentMethodInput) => subscriptionApi.addPaymentMethod(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods() })
    }
  })
}

export const useRemovePaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethodId: string) => subscriptionApi.removePaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods() })
    }
  })
}

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paymentMethodId: string) =>
      subscriptionApi.setDefaultPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.paymentMethods() })
    }
  })
}

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: (planType: PlanType) => subscriptionApi.createCheckoutSession(planType)
  })
}

export const useCreateBillingPortalSession = () => {
  return useMutation({
    mutationFn: subscriptionApi.createBillingPortalSession
  })
}
