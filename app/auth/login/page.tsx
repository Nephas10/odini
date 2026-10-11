"use client"

import Button from "@/components/button"
import Input from "@/components/input"
import { Lock, Mail } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from "react"
import { loginAction } from "../action"
import { useRouter } from "next/navigation"

function Login() {
  const router = useRouter()

  const [user, setUser] = useState({
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })

  const [showLoader, setShowLoader] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setUser({
      ...user,
      [name]: value,
    })

    setErrors({
      ...errors,
      [name]: "",
    })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newErrors = {
      email: "",
      password: "",
    }

    if (!user.email.trim()) {
      newErrors.email = "Please enter your email."
    }

    if (!user.password.trim()) {
      newErrors.password = "Please enter your password."
    }

    if (newErrors.email || newErrors.password) {
      setErrors(newErrors)
      return
    }

    setShowLoader(true)

    const result = await loginAction(user)

    setShowLoader(false)

    if (!result.success) {
      setErrors({
        email: "",
        password: result.error || "Invalid email or password.",
      })

      return
    }

    router.push("/user")
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-8 text-center text-2xl font-semibold text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit}>
          <Input
            type="email"
            label="Email"
            name="email"
            placeholder="Please enter your email"
            value={user.email}
            onChange={handleChange}
            error={errors.email}
            icon={<Mail size={20} />}
          />

          <Input
            type="password"
            label="Password"
            name="password"
            placeholder="Please enter your password"
            value={user.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={20} />}
          />

          <div className="mt-10">
            <Button
              text="Login"
              loading={showLoader}
              disabled={showLoader}
            />
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{" "}
          </span>

          <a
            href="/auth/signup"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login