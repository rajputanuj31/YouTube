'use client'
import { FaBars, FaSearch, FaUser, FaSignOutAlt, FaUserCircle, FaTrash, FaUpload } from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Login from './Auth/login';
import Register from './Auth/Register';
import api from '@/lib/api';
import { signOut } from '../app/store/user/userSlice';

export default function Navbar({ toggleSidebar }: { toggleSidebar?: () => void }) {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isClient, setIsClient] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        router.push('/');
    };

    const handleAvatarClick = () => {
        setShowUserMenu(!showUserMenu);
    };

    const handleLogoClick = () => {
        router.push('/');
    };

    const handleProfileClick = () => {
        if (currentUser) {
            router.push(`/profile/${currentUser._id}`);
            setShowUserMenu(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await api.post('/users/logout');
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

    const handleUploadVideo = () => {
        router.push('/video/uploadVideo');
    };

    if (!isClient) {
        return null; // Return null on the server-side
    }

    return (
        <nav
            className="flex items-center bg-black justify-between p-3 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 border-b border-gray-800"

        >
            <div className="flex items-center flex-shrink-0">
                <button className="mr-2 sm:mr-4 text-white hover:text-gray-300 transition-colors p-1" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    <FaBars size={22} />
                </button>
                <h1 className="text-xl sm:text-2xl font-bold text-white cursor-pointer" onClick={handleLogoClick}>PlayTube</h1>
            </div>
            <div className="flex-1 flex justify-center mx-2 sm:mx-4">
                <div className="relative w-full max-w-md sm:max-w-lg">
                    <input
                        type="text"
                        placeholder="Search..."
                        aria-label="Search videos"
                        className="w-full py-1.5 sm:py-2 pl-4 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-600 border border-gray-700 bg-gray-900/60 text-white text-sm sm:text-base transition-colors"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors" aria-label="Search">
                        <FaSearch size={16} />
                    </button>
                </div>
            </div>
            {currentUser ? (
                <div className="flex items-center">
                    <button 
                        className="text-white hover:text-gray-300 mr-3 sm:mr-6 transition-colors" 
                        onClick={handleUploadVideo}
                        title="Upload Video"
                        aria-label="Upload video"
                    >
                        <FaUpload size={18} />
                    </button>
                    <div className="relative" ref={userMenuRef}>
                        <button className="text-white hover:text-gray-300" onClick={handleAvatarClick}>
                            {currentUser.avatar ? (
                                <Image
                                    src={currentUser.avatar}
                                    alt="User Avatar"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 rounded-full object-cover border border-gray-300 shadow-sm transition-transform duration-300 hover:scale-105"
                                    unoptimized
                                />
                            ) : (
                                <FaUser size={24} />
                            )}
                        </button>
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-52 rounded-lg shadow-xl bg-gray-900 border border-gray-700/50 overflow-hidden">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <button
                                        onClick={handleProfileClick}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 hover:text-white w-full text-left transition-colors"
                                        role="menuitem"
                                    >
                                        <FaUserCircle /> Profile Details
                                    </button>
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-200 hover:bg-gray-800 hover:text-white w-full text-left transition-colors"
                                        role="menuitem"
                                    >
                                        <FaSignOutAlt /> Sign Out
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 w-full text-left transition-colors"
                                        role="menuitem"
                                    >
                                        <FaTrash /> Delete Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="relative">
                    <button
                        className="text-white text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors font-medium flex-shrink-0"
                        onClick={toggleLogin}
                    >
                        Sign In
                    </button>
                    {showLogin && (
                        <div className="absolute right-0 mt-2 w-[min(95vw,320px)] rounded-lg overflow-hidden shadow-2xl border border-gray-700/50">
                            <div className="bg-gray-900 p-4">
                                <h2 className="text-lg font-semibold text-white mb-4">Sign In</h2>
                                <Login onSuccess={() => setShowLogin(false)} />
                                <div className="mt-4 text-sm text-gray-400">
                                    <p>Don&apos;t have an account? <button className="text-blue-400 hover:underline" onClick={toggleRegister}>Sign up</button></p>
                                </div>
                            </div>
                        </div>
                    )}
                    {showRegister && (
                        <div className="absolute right-0 mt-2 w-[min(95vw,320px)] rounded-lg overflow-hidden shadow-2xl border border-gray-700/50 max-h-[80vh] overflow-y-auto">
                            <div className="bg-gray-900 p-4">
                                <h2 className="text-lg font-semibold text-white mb-4">Sign Up</h2>
                                <Register onSuccess={toggleLogin} />
                                <div className="mt-4 text-sm text-gray-400">
                                    <p>Already have an account? <button className="text-blue-400 hover:underline" onClick={toggleLogin}>Sign in</button></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}