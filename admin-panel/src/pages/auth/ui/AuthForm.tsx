import { useForm } from "@tanstack/react-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "../model/useAuth"
import { formSchema } from "../model/zod"

export function AuthForm() {
  const { login, isLoggingIn } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login({ email: value.email, password: value.password });

        toast.success("Успішний вхід", {
          description: "Ви успішно авторизувались в системі."
        });
      } catch (error) {
        toast.error("Помилка авторизації", {
          description: "Невірний email або пароль, спробуйте ще раз.",
        });
      }
    },
  })

  return (
    <Card className="w-[95%] max-w-md mx-auto mt-[15vh] p-4 md:p-[20px]">
      <CardHeader>
        <CardTitle>Вхід в систему</CardTitle>
      </CardHeader>
      <CardContent className="py-[20px]">
        <form
          id="auth-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="w-full"
        >
          <FieldGroup className="">
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="admin@workzora.com"
                      autoComplete="email"
                      disabled={isLoggingIn}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Пароль</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isLoggingIn}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal" className="w-full justify-end flex gap-2">
          <Button
            type="submit"
            form="auth-form"
            className="p-[10px]"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Вхід..." : "Увійти"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}