import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-573c6779/health", (c) => {
  return c.json({ status: "ok" });
});

// Save user profile
app.post("/make-server-573c6779/profile", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, profile } = body;
    
    if (!userId || !profile) {
      return c.json({ error: "Missing userId or profile data" }, 400);
    }
    
    await kv.set(`profile_${userId}`, profile);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error saving profile: ${error}`);
    return c.json({ error: "Failed to save profile" }, 500);
  }
});

// Get user profile
app.get("/make-server-573c6779/profile/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const profile = await kv.get(`profile_${userId}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }
    
    return c.json({ profile });
  } catch (error) {
    console.log(`Error getting profile: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

// Generate recipe using OpenAI
app.post("/make-server-573c6779/generate-recipe", async (c) => {
  try {
    const body = await c.req.json();
    const { ingredients, profile } = body;
    
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return c.json({ error: "Please provide at least one ingredient" }, 400);
    }
    
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return c.json({ error: "OpenAI API key not configured" }, 500);
    }
    
    // Build the prompt based on user profile and ingredients
    const cuisinePrefs = profile?.cuisinePreferences?.join(", ") || "any cuisine";
    const dietaryNeeds = profile?.dietaryNeeds?.join(", ") || "no dietary restrictions";
    const skillLevel = profile?.skillLevel || "beginner";
    const location = profile?.location || "";
    
    const prompt = `You are ChefMate, a helpful AI cooking assistant. Create a delicious recipe using these available ingredients: ${ingredients.join(", ")}.

User preferences:
- Cuisine preferences: ${cuisinePrefs}
- Dietary needs: ${dietaryNeeds}
- Cooking skill level: ${skillLevel}
${location ? `- Location: ${location}` : ""}

Please provide:
1. Recipe name
2. Brief description
3. Prep time and cook time
4. Difficulty level
5. Complete ingredient list (including amounts for ingredients provided, suggest amounts for missing ingredients)
6. Step-by-step cooking instructions
7. Serving size
8. Any helpful tips

Format your response as a well-structured recipe that's easy to follow for someone with ${skillLevel} cooking skills.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are ChefMate, a friendly and knowledgeable AI cooking assistant. Always provide practical, delicious recipes with clear instructions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log(`OpenAI API error: ${error}`);
      return c.json({ error: "Failed to generate recipe" }, 500);
    }
    
    const data = await response.json();
    const recipe = data.choices[0]?.message?.content;
    
    if (!recipe) {
      return c.json({ error: "No recipe generated" }, 500);
    }
    
    return c.json({ recipe });
  } catch (error) {
    console.log(`Error generating recipe: ${error}`);
    return c.json({ error: "Failed to generate recipe" }, 500);
  }
});

// Save chat message
app.post("/make-server-573c6779/chat", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, message, type } = body;
    
    if (!userId || !message || !type) {
      return c.json({ error: "Missing required fields" }, 400);
    }
    
    const chatKey = `chat_${userId}`;
    const existingChat = await kv.get(chatKey) || [];
    const newMessage = {
      id: Date.now(),
      message,
      type, // 'user' or 'assistant'
      timestamp: new Date().toISOString()
    };
    
    existingChat.push(newMessage);
    await kv.set(chatKey, existingChat);
    
    return c.json({ success: true, messageId: newMessage.id });
  } catch (error) {
    console.log(`Error saving chat message: ${error}`);
    return c.json({ error: "Failed to save message" }, 500);
  }
});

// Get chat history
app.get("/make-server-573c6779/chat/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const chat = await kv.get(`chat_${userId}`) || [];
    
    return c.json({ messages: chat });
  } catch (error) {
    console.log(`Error getting chat history: ${error}`);
    return c.json({ error: "Failed to get chat history" }, 500);
  }
});

Deno.serve(app.fetch);