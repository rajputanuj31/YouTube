"use client"
import { useState } from "react"
import axios from "axios"
import { useDispatch } from "react-redux"
import { signInStart, signInSuccess, signInFailure } from "../../app/store/user/userSlice"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const dispatch = useDispatch()
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {   
        dispatch(signInStart())
        e.preventDefault()
        setError(null)
        try {
            const response = await axios.post("/api/v1/users/login", {
                email,
                password
            })
            dispatch(signInSuccess(response.data))
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
            dispatch(signInFailure(error))
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="login-form bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md">
            <h2 className="login-header text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
            {error && (
                <div className="login-error mb-4 text-red-600 text-center bg-red-100 border border-red-400 rounded py-2 px-4">
                    {error}
                </div>
            )}
            <div className="mb-4">
                <input
                    className="login-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%' }}
                />
            </div>
            <div className="mb-6">
                <input
                    className="login-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%' }}
                />
            </div>
            <div className="flex items-center justify-center">
                <button
                    className="login-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 transform hover:scale-105"
                    type="submit"
                >
                    Login
                </button>
            </div>
        </form>
    )
}
