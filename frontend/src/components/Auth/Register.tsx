"use client"

import { useState } from "react"
import axios from "axios"
import api from "@/lib/api"

interface RegisterProps {
    onSuccess?: () => void
}

export default function Register({ onSuccess }: RegisterProps) {
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [avatar, setAvatar] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("fullName", fullName)
            formData.append("username", username)
            formData.append("email", email)
            formData.append("password", password)
            if (avatar) formData.append("avatar", avatar)
            if (coverImage) formData.append("coverImage", coverImage)

            await api.post("/users/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            setSuccess(true)
            setTimeout(() => onSuccess?.(), 1500)
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 500) {
                    setError("Internal server error. Please try again later.")
                } else {
                    setError(error.response?.data?.message || "An error occurred during registration.")
                }
            } else {
                setError("An unexpected error occurred.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-lg w-full max-w-md">
            {error && (
                <div className="mb-4 text-red-400 text-center bg-red-900/30 border border-red-800 rounded py-2 px-4">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 text-green-400 text-center bg-green-900/30 border border-green-800 rounded py-2 px-4">
                    Registration successful! Switching to login...
                </div>
            )}
            <div className="mb-4">
                <input
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    aria-label="Full name"
                />
            </div>
            <div className="mb-4">
                <input
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    aria-label="Username"
                />
            </div>
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
            <div className="mb-4">
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
            <div className="mb-4">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="avatar">
                    Avatar
                </label>
                <input
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor="coverImage">
                    Cover Image
                </label>
                <input
                    className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    type="file"
                    id="coverImage"
                    name="coverImage"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                />
            </div>
            <div className="flex items-center justify-center">
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Register"}
                </button>
            </div>
        </form>
    )
}
