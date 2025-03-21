"use client"

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContextProvider';
import { checkUsername } from '@/lib/users/checkUsername';

const ProfileForm = () => {
    const { showProfileForm, handleProfileSubmit } = useWallet();
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!showProfileForm) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // Validate username
        if (username.length < 3) {
            setError('Username must be at least 3 characters long');
            setIsSubmitting(false);
            return;
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
            setError('Username can only contain letters, numbers, underscores, and hyphens');
            setIsSubmitting(false);
            return;
        }

        const isUsernameAvailable = await checkUsername(username);
        console.log('Is username available:', isUsernameAvailable);
        if (!isUsernameAvailable) {
            setError('Username is already taken or has no followers on Twitter');
            setIsSubmitting(false);
            return;
        }

        try {
            await handleProfileSubmit(username);
        } catch (error) {
            setError('Failed to create profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold mb-4">Create Your Profile</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please enter your Twitter handle to create your profile.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium mb-1">
                            Twitter Handle
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:border-gray-600"
                            placeholder="Enter your Twitter handle"
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-2 px-4 rounded-lg bg-pink-600 text-white font-medium hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 ${
                            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfileForm; 