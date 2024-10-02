'use client'
import { FaBars, FaSearch, FaUser, FaSignOutAlt, FaUserCircle, FaTrash } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Login from './Auth/login';
import Register from './Auth/Register';
import axios from 'axios';
import { signOut } from '../app/store/user/userSlice';

export default function Navbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const currentUser = useSelector((state: any) => state.user.currentUser?.data.user)
    const router = useRouter();
    const dispatch = useDispatch();
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!currentUser) {
            router.push('/');
        }
    }, [currentUser, router]);

    const toggleLogin = () => {
        setShowLogin(!showLogin);
        setShowRegister(false);
    };

    const toggleRegister = () => {
        setShowRegister(!showRegister);
        setShowLogin(false);
    };

    const handleAvatarClick = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogoClick = () => {
        router.push('/');
    };

    const handleProfileClick = () => {
        if (currentUser) {
            router.push('/profile');
            setShowUserMenu(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await axios.post('/api/auth/logout');
            dispatch(signOut());
            setShowUserMenu(false);
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
            // Handle the error, maybe show a notification to the user
            dispatch(signOut()); // Still sign out on the client side
            router.push('/');
        }
    };

    const handleDeleteAccount = () => {
        // Implement delete account logic here
        // For example: dispatch(deleteAccount());
        setShowUserMenu(false);
    };

    if (!isClient) {
        return null; // Return null on the server-side
    }

    return (
        <nav
            className="flex items-center bg-black justify-between p-3 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-gray-800"

        >
            <div className="flex items-center">
                <button className="mr-4 text-white hover:text-gray-300" onClick={toggleSidebar}>
                    <FaBars size={24} />
                </button>
                <h1 className="text-2xl font-bold text-white cursor-pointer" onClick={handleLogoClick}>Logo</h1>
            </div>
            <div className="flex-grow flex justify-center">
                <div className="relative w-1/2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full py-2 px-4 rounded-full focus:outline-none border border-gray-800"
                        style={{
                            background: 'rgba(17, 19, 19, 0.4)',
                            borderRadius: '10px',
                            boxShadow: '0 .5rem 1rem rgba(194, 192, 192, 0.10) !important',
                            color: '#fff',
                            fontSize: '16px',
                            height: '2rem',
                        }}
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300">
                        <FaSearch size={18} />
                    </button>
                </div>
            </div>
            {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                    <button className="text-white hover:text-gray-300" onClick={handleAvatarClick}>
                        {currentUser.avatar ? (
                            <img
                                src={currentUser.avatar}
                                alt="User Avatar"
                                width={30}
                                height={30}
                                className="h-10 w-10 rounded-full object-cover border-1 border-gray-300 shadow-sm transition-transform duration-300 transform hover:scale-105"
                            />
                        ) : (
                            <FaUser size={24} />
                        )}
                    </button>
                    {showUserMenu && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-black ring-1 ring-black ring-opacity-5">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <button
                                    onClick={handleProfileClick}
                                    className="block px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                    role="menuitem"
                                >
                                    <FaUserCircle className="inline-block mr-2" /> Profile Details
                                </button>
                                <button
                                    onClick={handleSignOut}
                                    className="block px-4 py-2 text-sm text-white hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                    role="menuitem"
                                >
                                    <FaSignOutAlt className="inline-block mr-2" /> Sign Out
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 w-full text-left"
                                    role="menuitem"
                                >
                                    <FaTrash className="inline-block mr-2" /> Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative">
                    <button
                        className="text-white hover:text-gray-300 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
                        onClick={toggleLogin}
                    >
                        Sign In
                    </button>
                    {showLogin && (
                        <div className="absolute right-0 mt-2 w-80 rounded-lg overflow-hidden shadow-lg">
                            <div className="bg-white p-4">
                                <h2 className="text-lg font-semibold mb-4">Sign In</h2>
                                <Login />
                                <div className="mt-4 text-sm text-gray-600">
                                    <p>Don't have an account? <a href="#" className="text-blue-600 hover:underline" onClick={toggleRegister}>Sign up</a></p>
                                </div>
                            </div>
                        </div>
                    )}
                    {showRegister && (
                        <div className="absolute right-0 mt-2 w-80 rounded-lg overflow-hidden shadow-lg">
                            <div className="bg-white p-4">
                                <h2 className="text-lg font-semibold mb-4">Sign Up</h2>
                                <Register />
                                <div className="mt-4 text-sm text-gray-600">
                                    <p>Already have an account? <a href="#" className="text-blue-600 hover:underline" onClick={toggleLogin}>Sign in</a></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}