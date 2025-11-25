// session.queries.ts - заглушки для клиентских запросов (пока всё на server actions)

export const useRegisterMutation = () => {
  return { mutate: () => {}, isPending: false }
}

export const useResetPasswordMutation = () => {
  return {
    mutate: (_data: { email: string }) => {},
    isPending: false,
    isSuccess: false
  }
}
