
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, FilterLanguage, FilterType } from "../types";

// يتم جلب مفتاح API مباشرة من المتغير البيئي process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchMovies = async (query: string, language: FilterLanguage, type: FilterType): Promise<Movie[]> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Search for movies or series matching the name: "${query}".
    Filter requirements: Language status should be related to "${language}" and type should be "${type}".
    Return a list of at least 10 real movies/series in JSON format.
    Each object must have: 
    - title (Arabic), 
    - originalTitle (English), 
    - year (string), 
    - rating (number 0-10), 
    - poster (valid URL from image source if possible, or use placeholder format: https://picsum.photos/seed/{id}/400/600), 
    - type ('movie' or 'series'), 
    - languageStatus ('subtitled', 'dubbed', or 'original'), 
    - genre (array of strings), 
    - description (short summary in Arabic),
    - quality (e.g., '1080p', '4K'),
    - id (unique string).
    Ensure the data looks realistic for an Arabic movie platform.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              originalTitle: { type: Type.STRING },
              year: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              poster: { type: Type.STRING },
              type: { type: Type.STRING },
              languageStatus: { type: Type.STRING },
              genre: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              description: { type: Type.STRING },
              quality: { type: Type.STRING }
            },
            required: ["id", "title", "originalTitle", "year", "rating", "poster", "type", "languageStatus", "genre", "description", "quality"]
          }
        },
        tools: [{ googleSearch: {} }]
      }
    });

    const results = JSON.parse(response.text || "[]");
    
    // استخراج مصادر التوثيق (Grounding) إن وجدت
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = grounding
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => chunk.web.uri);

    return results.map((movie: any) => ({
      ...movie,
      sources: sourceUrls.length > 0 ? sourceUrls : ["https://www.google.com/search?q=" + encodeURIComponent(movie.originalTitle + " streaming")]
    }));
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

export const getFeaturedMovies = async (): Promise<Movie[]> => {
  return searchMovies("أفلام حائزة على جوائز", FilterLanguage.ALL, FilterType.ALL);
};
