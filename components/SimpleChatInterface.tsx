import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardContent } from './ui/card';
import { Send, Plus, X, Settings, Sparkles } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserProfile {
  cuisinePreferences: string[];
  dietaryNeeds: string[];
  skillLevel: string;
  location: string;
}

interface SimpleChatInterfaceProps {
  userProfile: UserProfile;
  userId: string;
}

interface Message {
  id: number;
  message: string;
  type: 'user' | 'assistant';
  timestamp: string;
  recipe?: any;
}

const commonIngredients = [
  '🍗 Chicken', '🥩 Beef', '🐟 Fish', '🍤 Shrimp', '🥚 Eggs',
  '🍚 Rice', '🍝 Pasta', '🥔 Potatoes', '🧄 Garlic', '🧅 Onions',
  '🥕 Carrots', '🥬 Lettuce', '🍅 Tomatoes', '🫑 Bell Peppers', '🥒 Cucumbers',
  '🧀 Cheese', '🥛 Milk', '🧈 Butter', '🫒 Olive Oil', '🧂 Salt'
];

export function SimpleChatInterface({ userProfile, userId }: SimpleChatInterfaceProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-573c6779/chat/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.log('Error loading chat history:', error);
    }
  };

  const addIngredient = (ingredient: string) => {
    const cleanIngredient = ingredient.replace(/[🍗🥩🐟🍤🥚🍚🍝🥔🧄🧅🥕🥬🍅🫑🥒🧀🥛🧈🫒🧂]/g, '').trim();
    if (cleanIngredient && !ingredients.some(ing => 
      ing.toLowerCase().replace(/[🍗🥩🐟🍤🥚🍚🍝🥔🧄🧅🥕🥬🍅🫑🥒🧀🥛🧈🫒🧂]/g, '').trim() === cleanIngredient.toLowerCase()
    )) {
      setIngredients(prev => [...prev, cleanIngredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(prev => prev.filter(ing => ing !== ingredient));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;

    setLoading(true);
    
    const userMessage: Message = {
      id: Date.now(),
      message: `I have these ingredients: ${ingredients.join(', ')}. Can you create a recipe for me?`,
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-573c6779/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            message: userMessage.message,
            userProfile,
            ingredients
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Date.now() + 1,
        message: data.message,
        type: 'assistant',
        timestamp: new Date().toISOString(),
        recipe: data.recipe
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating recipe:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: "Sorry, I couldn't generate a recipe right now. Please try again! 😅",
        type: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = () => {
    if (inputValue.trim()) {
      // Parse input for multiple ingredients separated by commas or "and"
      const newIngredients = inputValue
        .split(/[,&]|and/i)
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);
      
      newIngredients.forEach(addIngredient);
      setInputValue('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100 p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <span className="text-lg">👨‍🍳</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">ChefMate 🍳</h1>
              <p className="text-sm text-gray-600">Your AI Cooking Assistant ✨</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered 🤖
            </Badge>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Ingredient Input Section */}
      <div className="bg-white border-b border-blue-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">What ingredients do you have? 🥘</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Type ingredients (e.g., chicken, rice, carrots)... 🥕"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleInputSubmit();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleInputSubmit}
                variant="outline"
                className="border-teal-200 text-teal-600 hover:bg-teal-50"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Current Ingredients */}
          {ingredients.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Your Ingredients ({ingredients.length}) 🛒</h4>
                <Button
                  onClick={generateRecipe}
                  disabled={loading || ingredients.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 text-sm px-4 py-2"
                >
                  {loading ? '🔄 Creating...' : '🚀 Create Recipe!'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ingredient) => (
                  <Badge
                    key={ingredient}
                    variant="secondary"
                    className="bg-teal-100 text-teal-800 px-3 py-1"
                  >
                    {ingredient}
                    <button
                      onClick={() => removeIngredient(ingredient)}
                      className="ml-2 text-teal-600 hover:text-teal-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Suggestions */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Add Suggestions 💡</h4>
            <div className="flex flex-wrap gap-2">
              {commonIngredients.map((ingredient) => (
                <Button
                  key={ingredient}
                  variant="outline"
                  size="sm"
                  onClick={() => addIngredient(ingredient)}
                  className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                  disabled={ingredients.some(ing => 
                    ingredient.toLowerCase().includes(ing.toLowerCase()) || 
                    ing.toLowerCase().includes(ingredient.toLowerCase().replace(/[🍗🥩🐟🍤🥚🍚🍝🥔🧄🧅🥕🥬🍅🫑🥒🧀🥛🧈🫒🧂]/g, '').trim())
                  )}
                >
                  {ingredient}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">👋</div>
                <h3 className="font-medium text-gray-800 mb-2">Welcome to ChefMate! 🍳✨</h3>
                <p className="text-gray-600 mb-4">
                  I see you enjoy {userProfile.cuisinePreferences.join(', ').replace(/🍝|🌮|🥢|🍛|🫒|🍔|🥐|🍜|🍱|🥟|🧆|🥙/g, '')} cuisine 
                  and are at a {userProfile.skillLevel.charAt(0).toUpperCase() + userProfile.skillLevel.slice(1).replace(/-/g, ' ')} level! 
                </p>
                <p className="text-gray-600">
                  Add your ingredients above and I'll create personalized recipes just for you! 🎯
                </p>
              </CardContent>
            </Card>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className="flex">
              <div
                className={`max-w-3xl p-4 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white ml-12'
                    : 'bg-white shadow-sm mr-12'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-1 rounded-full mr-2">
                      <span className="text-sm">👨‍🍳</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">ChefMate 🤖</span>
                  </div>
                )}
                
                {message.recipe ? (
                  <RecipeCard recipe={message.recipe} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.message}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="bg-white shadow-sm p-4 rounded-lg mr-12">
              <div className="flex items-center mb-2">
                <div className="bg-blue-100 p-1 rounded-full mr-2">
                  <span className="text-sm">👨‍🍳</span>
                </div>
                <span className="text-sm font-medium text-gray-700">ChefMate 🤖</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-gray-600 ml-2">Crafting your perfect recipe... 🍳✨</span>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}