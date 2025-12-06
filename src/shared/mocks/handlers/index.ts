import { authHandlers } from './auth'
import { edgeHandlers } from './edge'
import { mapHandlers } from './map'
import { nodeHandlers } from './node'
import { paymentHandlers } from './payment'
import { subscriptionHandlers } from './subscription'
import { userHandlers } from './user'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...mapHandlers,
  ...nodeHandlers,
  ...edgeHandlers,
  ...subscriptionHandlers,
  ...paymentHandlers
]

// Re-export individual handler groups for selective use
export { authHandlers } from './auth'
export { edgeHandlers, resetEdgeState } from './edge'
export { mapHandlers, resetMapState } from './map'
export { nodeHandlers, resetNodeState } from './node'
export { paymentHandlers, resetPaymentState } from './payment'
export { resetSubscriptionState, subscriptionHandlers } from './subscription'
// Re-export reset functions for tests
export { resetUserState, userHandlers } from './user'
