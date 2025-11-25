import type { ActionFunctionArgs } from 'react-router'
import { ResetPasswordPage } from '@/pages/auth/reset-password-page'

export async function action({ request }: ActionFunctionArgs) {
  // Mock reset password logic
  const formData = await request.formData()
  const email = formData.get('email')

  if (email) {
    // В реальности тут был бы вызов API
    // Возвращаем успех, чтобы UI мог показать сообщение "Письмо отправлено"
    // Для простоты пока редиректим на подтверждение или просто возвращаем статус
    return { success: true }
  }

  return null
}

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />
}
