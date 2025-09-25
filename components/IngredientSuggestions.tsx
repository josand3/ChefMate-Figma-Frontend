import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, Sparkles } from 'lucide-react';

interface IngredientSuggestionsProps {
  onAddIngredient: (ingredient: string) => void;
}

const ingredientCategories = {
  'Proteins': ['chicken breast', 'ground beef', 'salmon', 'eggs', 'tofu', 'shrimp'],
  'Vegetables': ['onions', 'garlic', 'tomatoes', 'bell peppers', 'carrots', 'broccoli'],
  'Grains & Pasta': ['rice', 'pasta', 'quinoa', 'bread', 'flour', 'oats'],
  'Pantry Staples': ['olive oil', 'salt', 'pepper', 'butter', 'cheese', 'herbs']
};

export function IngredientSuggestions({ onAddIngredient }: IngredientSuggestionsProps) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-gray-800">
          <Sparkles className="w-5 h-5 text-green-600 mr-2" />
          Quick Start - Add Common Ingredients
        </CardTitle>
        <p className="text-sm text-gray-600">
          Tap any ingredient below to add it, or type your own in the message box
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(ingredientCategories).map(([category, ingredients]) => (
          <div key={category}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-100 hover:border-green-300 hover:text-green-700 transition-colors px-3 py-1.5"
                  onClick={() => onAddIngredient(ingredient)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        ))}
        
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            💡 You can also say things like "I have leftover chicken and some vegetables"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}