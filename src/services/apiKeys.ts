
// Clés API par défaut
export const DEFAULT_KEYS = {
  SERP_API_KEY: "00cdc35836508e3559df7a87a14bd3401fd26e0dd6a4afc6b1fabf054d026db6",
  GOOGLE_SEARCH_API_KEY: "AIzaSyDvNGx_B_JV1tZZH2q-d63DXMpJZ_J6mDw",
  GOOGLE_SEARCH_ENGINE_ID: "c32b4afa82f1648c4",
  BRIGHTDATA_API_KEY: "brd-customer-hl_a4fafc73-zone-luvvix:lrxxshdpwp1i",
  GEMINI_API_KEY: "AIzaSyAwoG5ldTXX8tEwdN-Df3lzWWT4ZCfOQPE",
};

export const API_URLS = {
  GEMINI_API_URL: "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent",
  SERP_API_URL: "https://serpapi.com/search",
  BRIGHTDATA_SEARCH_URL: "https://api.brightdata.com/dca/search",
  GOOGLE_SEARCH_URL: "https://www.googleapis.com/customsearch/v1",
};

export interface ApiKeys {
  serpApi: string;
  googleSearch: string;
  brightData: string;
}

export const getInitialApiKeys = (): ApiKeys => ({
  serpApi: DEFAULT_KEYS.SERP_API_KEY,
  googleSearch: DEFAULT_KEYS.GOOGLE_SEARCH_API_KEY,
  brightData: DEFAULT_KEYS.BRIGHTDATA_API_KEY,
});
