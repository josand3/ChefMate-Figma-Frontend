import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ChefHat, Send, Sparkles, User, Settings, Plus } from 'lucide-react';
import { RecipeCard } from './RecipeCard';
import { IngredientSuggestions } from './IngredientSuggestions';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Message {
  id: number;
  message: string;
  type: 'user' | 'assistant';
  timestamp: string;
  recipe?: string;
}

interface ChatInterfaceProps {
  userProfile: any;
  userId: string;
}

export function ChatInterface({ userProfile, userId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showIngredientInput, setShowIngredientInput] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
    // Add welcome message if no chat history
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now(),
        message: `Hi there! 👋 I'm ChefMate, your AI cooking assistant! 🍳✨\n\nI see you enjoy ${userProfile.cuisinePreferences.join(', ').replace(/🍝|🌮|🥢|🍛|🫒|🍔|🥐|🍜|🍱|🥟|🧆|🥙/g, '')} cuisine and cook at a ${userProfile.skillLevel.replace(/🔰|👨‍🍳|⭐/g, '')} level. Perfect! 🎯\n\nTo get started, tell me what ingredients you have in your kitchen! 🥘 You can:\n• 💬 Type them in the message box\n• 🏷️ Use the ingredient suggestions below\n• 🗣️ Just say "I have chicken, rice, and vegetables"\n\nWhat delicious meal would you like to cook today? 😋🔥`,
        type: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  const saveMessage = async (message: string, type: 'user' | 'assistant') => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-573c6779/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            userId,
            message,
            type
          }),
        }
      );
    } catch (error) {
      console.log('Error saving message:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue;
    setInputValue('');
    setLoading(true);

    // Add user message to chat
    const newUserMessage: Message = {
      id: Date.now(),
      message: userMessage,
      type: 'user',
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    await saveMessage(userMessage, 'user');

    // Extract ingredients from the message (simple parsing)
    const extractedIngredients = extractIngredientsFromText(userMessage);
    if (extractedIngredients.length > 0) {
      setIngredients(prev => [...new Set([...prev, ...extractedIngredients])]);
    }

    try {
      // Generate recipe
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-573c6779/generate-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            ingredients: [...ingredients, ...extractedIngredients],
            profile: userProfile
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: Date.now() + 1,
          message: `Great! I found some delicious recipes using your ingredients. Here's what I recommend:`,
          type: 'assistant',
          timestamp: new Date().toISOString(),
          recipe: data.recipe
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        await saveMessage(assistantMessage.message, 'assistant');
      } else {
        const error = await response.json();
        const errorMessage: Message = {
          id: Date.now() + 1,
          message: `Sorry, I had trouble generating a recipe. ${error.error || 'Please try again.'}`,
          type: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        message: 'Sorry, I had trouble connecting to generate your recipe. Please try again.',
        type: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const extractIngredientsFromText = (text: string): string[] => {
    const commonIngredients = [
      'chicken', 'beef', 'pork', 'fish', 'salmon', 'shrimp', 'eggs',
      'rice', 'pasta', 'bread', 'flour', 'potatoes', 'onions', 'garlic',
      'tomatoes', 'carrots', 'bell peppers', 'broccoli', 'spinach',
      'cheese', 'milk', 'butter', 'olive oil', 'salt', 'pepper',
      'basil', 'oregano', 'thyme', 'ginger', 'lemon', 'lime'
    ];
    
    const words = text.toLowerCase().split(/[,\s]+/);
    return commonIngredients.filter(ingredient => 
      words.some(word => word.includes(ingredient) || ingredient.includes(word))
    );
  };

  const addIngredient = (ingredient: string) => {
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients(prev => [...prev, ingredient]);
    }
    setCurrentIngredient('');
    setShowIngredientInput(false);
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(prev => prev.filter(i => i !== ingredient));
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-teal-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
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

      {/* Ingredients Bar */}
      {ingredients.length > 0 && (
        <div className="bg-white border-b p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Your Ingredients: 🧄🥕🥬</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIngredientInput(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add ➕
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
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {showIngredientInput && (
              <div className="flex items-center space-x-2 mt-3">
                <Input
                  placeholder="Add an ingredient..."
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addIngredient(currentIngredient);
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={() => addIngredient(currentIngredient)}
                  size="sm"
                  className="bg-teal-500 hover:bg-teal-600"
                >
                  Add ✅
                </Button>
                <Button
                  onClick={() => setShowIngredientInput(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
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
                
                <div className="whitespace-pre-wrap">{message.message}</div>
                
                {message.recipe && (
                  <div className="mt-4">
                    <RecipeCard recipe={message.recipe} />
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
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
                  <span className="text-gray-600 ml-2">Generating your recipe... 🍳✨</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Ingredient Suggestions */}
      {ingredients.length === 0 && (
        <div className="p-4 bg-white border-t">
          <div className="max-w-4xl mx-auto">
            <IngredientSuggestions onAddIngredient={addIngredient} />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <Input
              placeholder="Tell me what ingredients you have, or ask for recipe suggestions... 💬"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleSendMessage();
                }
              }}
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}