import { ForgotPasswordForm } from '@modules/auth'
import { AuthLayout } from '@shared/layouts'

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  )
}
