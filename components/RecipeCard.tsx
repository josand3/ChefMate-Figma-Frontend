import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, Users, ChefHat, Star, Bookmark, Share2 } from 'lucide-react';

interface RecipeCardProps {
  recipe: string;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Parse the recipe text to extract structured information
  const parseRecipe = (recipeText: string) => {
    const lines = recipeText.split('\n');
    let title = '';
    let description = '';
    let prepTime = '';
    let cookTime = '';
    let difficulty = '';
    let servings = '';
    let ingredients: string[] = [];
    let instructions: string[] = [];
    let tips = '';

    let currentSection = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Try to extract title (usually first non-empty line or contains "Recipe:")
      if (!title && (trimmedLine.includes('Recipe:') || lines.indexOf(line) < 3)) {
        title = trimmedLine.replace(/^(Recipe:\s*|#\s*)/i, '');
        return;
      }

      // Look for time information
      if (trimmedLine.toLowerCase().includes('prep time') || trimmedLine.toLowerCase().includes('preparation time')) {
        prepTime = trimmedLine;
        return;
      }
      if (trimmedLine.toLowerCase().includes('cook time') || trimmedLine.toLowerCase().includes('cooking time')) {
        cookTime = trimmedLine;
        return;
      }
      if (trimmedLine.toLowerCase().includes('total time')) {
        const totalTime = trimmedLine;
        if (!prepTime && !cookTime) {
          prepTime = totalTime;
        }
        return;
      }

      // Look for difficulty
      if (trimmedLine.toLowerCase().includes('difficulty')) {
        difficulty = trimmedLine;
        return;
      }

      // Look for servings
      if (trimmedLine.toLowerCase().includes('serving') || trimmedLine.toLowerCase().includes('yield')) {
        servings = trimmedLine;
        return;
      }

      // Section headers
      if (trimmedLine.toLowerCase().includes('ingredients')) {
        currentSection = 'ingredients';
        return;
      }
      if (trimmedLine.toLowerCase().includes('instructions') || trimmedLine.toLowerCase().includes('directions') || trimmedLine.toLowerCase().includes('steps')) {
        currentSection = 'instructions';
        return;
      }
      if (trimmedLine.toLowerCase().includes('tips') || trimmedLine.toLowerCase().includes('notes')) {
        currentSection = 'tips';
        return;
      }

      // Add content to current section
      if (currentSection === 'ingredients' && (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d/.test(trimmedLine))) {
        ingredients.push(trimmedLine.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, ''));
      } else if (currentSection === 'instructions' && (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || /^\d/.test(trimmedLine))) {
        instructions.push(trimmedLine.replace(/^[-•]\s*/, '').replace(/^\d+\.\s*/, ''));
      } else if (currentSection === 'tips') {
        tips += trimmedLine + ' ';
      } else if (!title && !description && currentSection === '') {
        description = trimmedLine;
      }
    });

    return {
      title: title || 'Delicious Recipe',
      description,
      prepTime,
      cookTime,
      difficulty,
      servings,
      ingredients,
      instructions,
      tips: tips.trim()
    };
  };

  const parsedRecipe = parseRecipe(recipe);

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-gray-800 mb-2">
              {parsedRecipe.title}
            </CardTitle>
            {parsedRecipe.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {parsedRecipe.description}
              </p>
            )}
          </div>
          <div className="flex space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSaved(!isSaved)}
              className={isSaved ? 'text-blue-600' : 'text-gray-400'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved && <span className="ml-1">💾</span>}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-teal-600">
              <Share2 className="w-4 h-4" />
              <span className="ml-1">📤</span>
            </Button>
          </div>
        </div>

        {/* Recipe metadata */}
        <div className="flex flex-wrap gap-2 mt-4">
          {parsedRecipe.prepTime && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Clock className="w-3 h-3 mr-1" />
              ⏰ {parsedRecipe.prepTime.replace(/prep time:?\s*/i, '')}
            </Badge>
          )}
          {parsedRecipe.cookTime && (
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <ChefHat className="w-3 h-3 mr-1" />
              🔥 {parsedRecipe.cookTime.replace(/cook time:?\s*/i, '')}
            </Badge>
          )}
          {parsedRecipe.servings && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Users className="w-3 h-3 mr-1" />
              👥 {parsedRecipe.servings.replace(/serving[s]?:?\s*/i, '').replace(/yield:?\s*/i, '')}
            </Badge>
          )}
          {parsedRecipe.difficulty && (
            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
              <Star className="w-3 h-3 mr-1" />
              ⭐ {parsedRecipe.difficulty.replace(/difficulty:?\s*/i, '')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Ingredients */}
        {parsedRecipe.ingredients.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">🥕</span>
              Ingredients
            </h4>
            <div className="grid gap-2">
              {parsedRecipe.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center p-2 bg-white rounded-lg border border-gray-100"
                >
                  <div className="w-1.5 h-1.5 bg-teal-400 rounded-full mr-3 flex-shrink-0"></div>
                  <span className="text-gray-700 text-sm">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {parsedRecipe.instructions.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <span className="mr-2">📝</span>
              Instructions
            </h4>
            <div className="space-y-3">
              {parsedRecipe.instructions.map((instruction, index) => (
                <div
                  key={index}
                  className="flex items-start p-3 bg-white rounded-lg border border-gray-100"
                >
                  <div className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {parsedRecipe.tips && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
              Chef's Tips
            </h4>
            <p className="text-amber-700 text-sm leading-relaxed">{parsedRecipe.tips}</p>
          </div>
        )}

        {/* Fallback: Show raw recipe if parsing didn't work well */}
        {parsedRecipe.ingredients.length === 0 && parsedRecipe.instructions.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
              {recipe}
            </pre>
          </div>
        )}

        {/* AI Badge */}
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Recipe generated by AI
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}