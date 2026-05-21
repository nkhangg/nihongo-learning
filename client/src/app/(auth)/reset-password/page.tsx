import { Suspense } from 'react'
import { ResetPasswordForm } from '@modules/auth'
import { AuthLayout } from '@shared/layouts'

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
