const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function getRecipeFromMistral(ingredientsArr) {
  const ingredientsString = ingredientsArr.join(", ");

  const systemPrompt = `You are a creative chef assistant. Create delicious recipes based on the ingredients provided. Format your response in markdown with a recipe title, ingredients list with quantities, and step-by-step instructions.`;

  const userPrompt = `I have the following ingredients: ${ingredientsString}.

Please suggest a delicious recipe I can make using some or all of these ingredients. You can suggest a few additional common ingredients if needed.

Format your response with:
- Recipe title (as ## heading)
- Ingredients list with quantities
- Step-by-step cooking instructions
- Cooking time

Make it detailed and easy to follow!`;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "Chef Claude Recipe App",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      throw new Error(
        `API Error: ${response.status} - ${
          errorData.error?.message || "Unknown error"
        }`
      );
    }

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else {
      console.error("Unexpected response format:", data);
      throw new Error("Unexpected response format from OpenRouter");
    }
  } catch (err) {
    console.error("Error generating recipe:", err);

    if (err.message.includes("401") || err.message.includes("Unauthorized")) {
      return `## ❌ API Key Error\n\nYour OpenRouter API key is invalid or not set.\n\n**To fix:**\n1. Get a free API key from https://openrouter.ai/keys\n2. Add it to your .env file as: \`VITE_OPENROUTER_API_KEY=your_key_here\`\n3. Restart your dev server (Ctrl+C, then npm run dev)`;
    }

    if (err.message.includes("429")) {
      return `## ⏳ Rate Limit Reached\n\nYou've made too many requests. Please wait a moment and try again.`;
    }

    return `## ❌ Error Generating Recipe\n\n**Error:** ${err.message}\n\n**Please check:**\n- Your OpenRouter API key is valid\n- Your internet connection\n- Try again in a moment`;
  }
}
