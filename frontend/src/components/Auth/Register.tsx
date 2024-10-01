"use client"

import { useState } from "react"
import axios from "axios"

export default function Register() {
    const [fullName, setFullName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [avatar, setAvatar] = useState<File | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        try {
            const formData = new FormData()
            formData.append("fullName", fullName)
            formData.append("username", username)
            formData.append("email", email)
            formData.append("password", password)
            if (avatar) formData.append("avatar", avatar)
            if (coverImage) formData.append("coverImage", coverImage)

            const response = await axios.post("http://localhost:8000/api/v1/users/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            })
            console.log(response.data)
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
            console.error(error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="signup-form bg-white shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4 w-full max-w-md mx-auto">
            <h2 className="signup-header text-3xl font-bold mb-6 text-center text-gray-800">Register</h2>
            {error && (
                <div className="signup-error mb-4 text-red-600 text-center bg-red-100 border border-red-400 rounded py-2 px-4">
                    {error}
                </div>
            )}
            <div className="mb-4">
                <input
                    className="signup-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <input
                    className="signup-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <input
                    className="signup-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <input
                    className="signup-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="avatar">
                    Avatar
                </label>
                <input
                    className="signup-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="coverImage">
                    Cover Image
                </label>
                <input
                    className="signup-input shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    type="file"
                    name="coverImage"
                    accept="image/*"
                    onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                />
            </div>
            <div className="flex items-center justify-center">
                <button
                    className="signup-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 transform hover:scale-105"
                    type="submit"
                >
                    Register
                </button>
            </div>
        </form>
    )   
}
