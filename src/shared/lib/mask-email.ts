export const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@')
  if (!local || !domain) {
    return email
  }
  const visible = local.slice(0, 2)
  return `${visible}***@${domain}`
}
