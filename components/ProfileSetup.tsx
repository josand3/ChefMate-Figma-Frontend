import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ChefHat, MapPin, User, Utensils } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfileSetupProps {
  onComplete: (profile: any) => void;
  userId: string;
}

const cuisineOptions = [
  '🍝 Italian', '🌮 Mexican', '🥢 Asian', '🍛 Indian', '🫒 Mediterranean', '🍔 American', 
  '🥐 French', '🍜 Thai', '🍱 Japanese', '🥟 Chinese', '🧆 Greek', '🥙 Middle Eastern'
];

const dietaryOptions = [
  '🥬 Vegetarian', '🌱 Vegan', '🌾 Gluten-Free', '🥛 Dairy-Free', '🥑 Keto', 
  '🦴 Paleo', '🥗 Low-Carb', '🚫🥜 Nut-Free', '🍽️ No restrictions'
];

const skillLevels = [
  { value: 'stage', label: '🎭 Stage', desc: 'Just starting out - simple recipes with basic techniques 🍳' },
  { value: 'line-cook', label: '👨‍🍳 Line Cook', desc: 'Some experience with various cooking methods 🔥' },
  { value: 'sous-chef', label: '👨‍💼 Sous Chef', desc: 'Comfortable with complex recipes and techniques 🎖️' },
  { value: 'executive-chef', label: '⭐👨‍🍳 Executive Chef', desc: 'Master of the kitchen - bring on the challenge! 🏆' }
];

export function ProfileSetup({ onComplete, userId }: ProfileSetupProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    cuisinePreferences: [] as string[],
    dietaryNeeds: [] as string[],
    skillLevel: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);

  const handleCuisineToggle = (cuisine: string) => {
    setProfile(prev => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
        ? prev.cuisinePreferences.filter(c => c !== cuisine)
        : [...prev.cuisinePreferences, cuisine]
    }));
  };

  const handleDietaryToggle = (dietary: string) => {
    setProfile(prev => ({
      ...prev,
      dietaryNeeds: prev.dietaryNeeds.includes(dietary)
        ? prev.dietaryNeeds.filter(d => d !== dietary)
        : [...prev.dietaryNeeds, dietary]
    }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-573c6779/profile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            profile
          }),
        }
      );

      if (response.ok) {
        onComplete(profile);
      } else {
        console.error('Failed to save profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return profile.cuisinePreferences.length > 0;
      case 2: return profile.dietaryNeeds.length > 0;
      case 3: return profile.skillLevel !== '';
      case 4: return profile.location.trim() !== '';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full">
              <span className="text-2xl">👨‍🍳</span>
            </div>
          </div>
          <CardTitle className="text-2xl text-blue-700">Welcome to ChefMate! 🍳✨</CardTitle>
          <p className="text-gray-600 mt-2">Let's set up your cooking profile to get personalized recipes 📝</p>
          <div className="flex justify-center mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full mx-1 ${
                  i <= step ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl mr-2">🍽️</span>
                <h3 className="text-lg font-semibold">What cuisines do you enjoy? 😋</h3>
              </div>
              <p className="text-gray-600 mb-4">Select all that apply (the more the merrier! 🎉):</p>
              <div className="grid grid-cols-2 gap-2">
                {cuisineOptions.map((cuisine) => (
                  <Badge
                    key={cuisine}
                    variant={profile.cuisinePreferences.includes(cuisine) ? "default" : "outline"}
                    className={`cursor-pointer justify-center py-2 px-3 transition-all ${
                      profile.cuisinePreferences.includes(cuisine)
                        ? 'bg-blue-500 hover:bg-blue-600 scale-105'
                        : 'hover:bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => handleCuisineToggle(cuisine)}
                  >
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl mr-2">🥗</span>
                <h3 className="text-lg font-semibold">Any dietary needs? 🤔</h3>
              </div>
              <p className="text-gray-600 mb-4">Select all that apply (we'll make sure every recipe fits! ✅):</p>
              <div className="grid grid-cols-2 gap-2">
                {dietaryOptions.map((dietary) => (
                  <Badge
                    key={dietary}
                    variant={profile.dietaryNeeds.includes(dietary) ? "default" : "outline"}
                    className={`cursor-pointer justify-center py-2 px-3 transition-all ${
                      profile.dietaryNeeds.includes(dietary)
                        ? 'bg-teal-500 hover:bg-teal-600 scale-105'
                        : 'hover:bg-teal-50 border-teal-200'
                    }`}
                    onClick={() => handleDietaryToggle(dietary)}
                  >
                    {dietary}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl mr-2">👨‍🍳</span>
                <h3 className="text-lg font-semibold">What's your cooking skill level? 🔥</h3>
              </div>
              <div className="space-y-3">
                {skillLevels.map((skill) => (
                  <div
                    key={skill.value}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      profile.skillLevel === skill.value
                        ? 'border-blue-500 bg-blue-50 scale-105'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setProfile(prev => ({ ...prev, skillLevel: skill.value }))}
                  >
                    <div className="font-semibold text-gray-800">{skill.label}</div>
                    <div className="text-sm text-gray-600 mt-1">{skill.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-center mb-4">
                <span className="text-xl mr-2">🌍</span>
                <h3 className="text-lg font-semibold">Where are you located? 📍</h3>
              </div>
              <p className="text-gray-600 mb-4">This helps us suggest recipes with locally available ingredients! 🥕🥬</p>
              <div className="space-y-2">
                <Label htmlFor="location">City, Country 🏙️</Label>
                <Input
                  id="location"
                  placeholder="e.g., New York, USA 🗽"
                  value={profile.location}
                  onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
              >
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Next ➡️
              </Button>
            ) : (
              <Button
                onClick={handleSaveProfile}
                disabled={!canProceed() || saving}
                className="bg-teal-500 hover:bg-teal-600"
              >
                {saving ? '⏳ Saving...' : 'Start Cooking! 🚀'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}