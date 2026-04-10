/**
 * Utility for interacting with the Google Search API via Serper.dev.
 * Extracts organic rankings and "People Also Ask" questions for intent analysis.
 */
export async function fetchSerpData(keyword: string) {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    throw new Error("SERPER_API_KEY is missing in environment variables.");
  }

  const myHeaders = new Headers();
  myHeaders.append("X-API-KEY", apiKey);
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    q: keyword,
    gl: "us", // Geolocated to United States for baseline English results
    hl: "en", // Language set to English
    num: 10,  // Fetch top 10 results
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  try {
    const response = await fetch("https://google.serper.dev/search", requestOptions);
    
    if (!response.ok) {
      throw new Error(`Serper API returned status: ${response.status}`);
    }

    const data = await response.json();

    // Format and sanitize the extracted data
    return {
      organicResults: data.organic || [],
      relatedQuestions: data.peopleAlsoAsk ? data.peopleAlsoAsk.map((item: any) => item.question) : [],
      relatedSearches: data.relatedSearches ? data.relatedSearches.map((item: any) => item.query) : [],
    };
  } catch (error) {
    console.error("SERP Extraction Error:", error);
    throw new Error("Failed to extract search engine data.");
  }
}