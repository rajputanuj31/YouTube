"use client"
import { useState } from "react"
import axios from "axios"
import api from "@/lib/api"
import { useDispatch } from "react-redux"
import { signInStart, signInSuccess, signInFailure } from "../../app/store/user/userSlice"

interface LoginProps {
    onSuccess?: () => void
}

export default function Login({ onSuccess }: LoginProps) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const dispatch = useDispatch()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        dispatch(signInStart())
        setError(null)
        try {
            const response = await api.post("/users/login", {
                email,
                password
            })
            dispatch(signInSuccess(response.data))
            onSuccess?.()
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    setError("Internal server error. Please try again later.")
                } else {
                    setError(error.response?.data?.message || "An error occurred during login.")
                }
            } else {
                setError("An unexpected error occurred.")
            }
            dispatch(signInFailure(error instanceof Error ? error.message : "Login failed"))
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-lg w-full max-w-md">
            {error && (
                <div className="mb-4 text-red-400 text-center bg-red-900/30 border border-red-800 rounded py-2 px-4">
                    {error}
                </div>
            )}
            <div className="mb-4">
                <input
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-label="Email address"
                />
            </div>
            <div className="mb-6">
                <input
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-label="Password"
                />
            </div>
            <div className="flex items-center justify-center">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200"
                    type="submit"
                >
                    Login
                </button>
            </div>
        </form>
    )
}
