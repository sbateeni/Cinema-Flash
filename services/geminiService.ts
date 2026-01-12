
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, FilterLanguage, FilterType } from "../types";
import { TRUSTED_ARABIC_SOURCES } from "../constants/sources";

const API_KEY = process.env.API_KEY;
const DAILY_LIMIT = 1500;

export const checkApiStatus = (): boolean => {
  return !!API_KEY && API_KEY.length > 10;
};

export const getApiDiagnostics = () => {
  const hasKey = !!API_KEY;
  if (!hasKey) return { message: "مفتاح API مفقود", details: "يرجى إضافة مفتاح Gemini في إعدادات المشروع." };
  return { message: "المفتاح متصل", details: "نظام الوكلاء المتعددين (Multi-Agent) جاهز للعمل." };
};

export const getDailyUsage = () => {
  const today = new Date().toDateString();
  const storedData = localStorage.getItem('gemini_usage');
  if (!storedData) return { count: 0, date: today };
  const parsed = JSON.parse(storedData);
  if (parsed.date !== today) return { count: 0, date: today };
  return parsed;
};

const incrementUsage = () => {
  const usage = getDailyUsage();
  const newData = { count: usage.count + 1, date: usage.date };
  localStorage.setItem('gemini_usage', JSON.stringify(newData));
  return newData.count;
};

export const getRemainingRequests = () => {
  const usage = getDailyUsage();
  return Math.max(0, DAILY_LIMIT - usage.count);
};

const getAIInstance = () => {
  if (!checkApiStatus()) return null;
  return new GoogleGenAI({ apiKey: API_KEY! });
};

export const searchMovies = async (query: string, language: FilterLanguage, type: FilterType): Promise<Movie[]> => {
  const ai = getAIInstance();
  if (!ai) throw new Error("API_KEY_MISSING");
  
  incrementUsage();

  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are the "Arabic Streaming Hunter". Your task is to find DIRECT watch/view pages for: "${query}".
    
    CRITICAL PROTOCOL:
    1. MIRROR SEARCH: Arabic movie sites (MyCima, EgyBest, Akwam, iWaatch) constantly change their TLDs (e.g., .tv to .show to .cc). 
    2. USE GOOGLE SEARCH: First find the current active mirror for the sites listed in our trusted list.
    3. PATTERN MATCHING: Prioritize URLs containing "/watch/", "/view/", "/v/", or "/movie/".
    4. EXCLUSION: Discard homepages, category pages, search results, or ad-landing pages.
    5. TARGET SOURCES: Focus on iWaatch, WeCima, Akwam, FaselHD, and EgyBest.
    
    OUTPUT: A strict JSON array. For each 'sources' link, ensure the URL path actually contains the movie name (e.g., /view/The_Beekeeper).
  `;

  const prompt = `
    Find working deep links for "${query}" on active mirrors of trusted Arabic sites.
    Filter: Language ${language}, Type ${type}.
    Pay special attention to finding links on iWaatch.com and WeCima mirrors.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
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
              genre: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              quality: { type: Type.STRING },
              sources: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "title", "originalTitle", "year", "rating", "poster", "type", "languageStatus", "genre", "description", "quality", "sources"]
          }
        }
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const discoveredUrls = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => chunk.web.uri);

    let results = JSON.parse(response.text || "[]");

    return results.map((movie: any) => {
      let verifiedSources: string[] = [];
      const allCandidateUrls = Array.from(new Set([...(movie.sources || []), ...discoveredUrls]));

      allCandidateUrls.forEach((url: string) => {
        const u = url.toLowerCase();
        
        // التحقق من المصدر أو المرايا النشطة
        const trustedSource = TRUSTED_ARABIC_SOURCES.find(source => 
          source.aliases.some(alias => u.includes(alias.split('.')[0])) || 
          u.includes(source.domain.split('.')[0])
        );

        if (trustedSource || u.includes('iwaatch') || u.includes('wecima') || u.includes('mycima')) {
          // تنظيف اسم الفيلم للبحث عنه في الرابط
          const cleanTitle = movie.originalTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const titleSlug = cleanTitle.split('_').filter(w => w.length > 2);
          
          const hasMovieReference = titleSlug.some(w => u.includes(w)) || 
                                   movie.title.split(' ').some(w => w.length > 2 && u.includes(w));
          
          const isNotNavigational = !u.includes('/search') && !u.includes('/category/') && !u.includes('/tag/') && u.length > 25;
          const isDeepLink = u.includes('/view/') || u.includes('/watch/') || u.includes('/movie/') || u.includes('/series/');

          if (hasMovieReference && isNotNavigational && isDeepLink) {
            verifiedSources.push(url);
          }
        }
      });

      // ترتيب الروابط حسب الأولوية وتوافق الأنماط
      verifiedSources.sort((a, b) => {
        const aLow = a.toLowerCase();
        const bLow = b.toLowerCase();
        
        // إعطاء أولوية قصوى لموقع iwaatch و wecima لأنها الأكثر نشاطاً حالياً
        const aBoost = (aLow.includes('iwaatch') || aLow.includes('wecima')) ? 2 : 0;
        const bBoost = (bLow.includes('iwaatch') || bLow.includes('wecima')) ? 2 : 0;
        
        return bBoost - aBoost;
      });

      return {
        ...movie,
        sources: Array.from(new Set(verifiedSources)).slice(0, 12)
      };
    });
  } catch (error) {
    console.error("Agentic System Error:", error);
    throw error;
  }
};

export const getFeaturedMovies = async (): Promise<Movie[]> => {
  try {
    return await searchMovies("أحدث الأفلام المترجمة 2024 2025", FilterLanguage.ALL, FilterType.ALL);
  } catch {
    return [];
  }
};
