import React, { useState, useEffect } from 'react';
import { ProfileSetup } from '../components/ProfileSetup';
import { SimpleChatInterface } from '../components/SimpleChatInterface';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Generate a simple user ID for this session
const getUserId = () => {
  let userId = localStorage.getItem('chefmate_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chefmate_user_id', userId);
  }
  return userId;
};

interface UserProfile {
  cuisinePreferences: string[];
  dietaryNeeds: string[];
  skillLevel: string;
  location: string;
}

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-573c6779/profile/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = (profile: UserProfile) => {
    setUserProfile(profile);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">👨‍🍳</div>
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ChefMate... 🍳✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-100">
      {!userProfile ? (
        <ProfileSetup onComplete={handleProfileComplete} userId={userId} />
      ) : (
        <SimpleChatInterface userProfile={userProfile} userId={userId} />
      )}
    </div>
  );
}