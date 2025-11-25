import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useActionData, useNavigation, useSubmit } from 'react-router' // useSubmit added
import { z } from 'zod'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { FormDivider } from '@/shared/ui/form-divider'
import { Input } from '@/shared/ui/input'

const signInSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов')
})

export function SignInForm() {
  const navigation = useNavigation()
  const actionData = useActionData<{ error?: string }>()
  const submit = useSubmit() // Хук для программной отправки формы

  const isLoading = navigation.state === 'submitting'

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: 'm@example.com',
      password: 'password'
    }
  })

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit(data => {
            // Программно отправляем форму через React Router
            submit(data, { method: 'post' })
          })}
        >
          {actionData?.error && (
            <div className="text-sm font-medium text-destructive text-center">
              {actionData.error}
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="m@example.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Пароль</FormLabel>
                  <a
                    href="/auth/reset-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Забыли пароль?
                  </a>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Войти
          </Button>

          <FormDivider>или</FormDivider>

          <Button variant="outline" className="w-full" type="button">
            Войти через GitHub
          </Button>
        </form>
      </Form>
    </div>
  )
}
