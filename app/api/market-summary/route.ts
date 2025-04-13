import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

let deepseekOpenAI = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

let chatgptOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to format economic events
function formatEconomicEvents(calendar: any[]) {
  if (!calendar || calendar.length === 0) return "No economic events data available";
  
  // Sort events by date and time (most recent first)
  const sortedEvents = [...calendar].sort((a, b) => {
    const dateA = new Date(a.Datetime);
    const dateB = new Date(b.Datetime);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Group events by date
  const eventsByDate: Record<string, any[]> = {};
  sortedEvents.forEach(event => {
    if (!eventsByDate[event.Date]) {
      eventsByDate[event.Date] = [];
    }
    eventsByDate[event.Date].push(event);
  });
  
  // Format events with impact indicators and actual vs expected values
  let formattedEvents = "";
  for (const date in eventsByDate) {
    formattedEvents += `\n${date}:\n`;
    eventsByDate[date].forEach(event => {
      const impactIndicator = "🔴".repeat(parseInt(event.Impact));
      const actualValue = event.Actual !== null ? `Actual: ${event.Actual}` : "";
      const expectedValue = event.Expected !== null ? `Expected: ${event.Expected}` : "";
      const priorValue = event.Prior !== null ? `Prior: ${event.Prior}` : "";
      
      formattedEvents += `  ${event.Time} - ${impactIndicator} ${event.Release} (${event.For})\n`;
      if (actualValue || expectedValue || priorValue) {
        formattedEvents += `    ${[actualValue, expectedValue, priorValue].filter(Boolean).join(", ")}\n`;
      }
    });
  }
  
  return formattedEvents;
}

// Helper function to call the fallback API
async function callFallbackAPI(prompt: string) {
  try {
    const response = await fetch('https://aiapi-tno8.onrender.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a market analyst providing concise insights." },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
        wrap_input: true
      }),
    });

    if (!response.ok) {
      throw new Error(`Fallback API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return {
      model: "g4f",
      result: {
        choices: [
          {
            message: {
              content: data.response || data.message || "No response from fallback API"
            }
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error calling fallback API:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  const maxRetries = 2; // Maximum number of retry attempts
  const retryDelay = 1000; // Delay between retries in milliseconds

  try {
    const { fearGreedValue, sectorPerformance, economicEvents } = await req.json();
    
    // Format economic events data
    const formattedEconomicEvents = formatEconomicEvents(economicEvents?.calendar);
    
    // Get today's date in a readable format
    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `
      As a market analyst, provide a concise summary of the current market conditions for ${today} based on the following data:
      
      Fear & Greed Index: ${fearGreedValue}
      
      Sector Performance:
      ${sectorPerformance
        ?.map((sector: { sector: any; performance: any; }) => `${sector.sector}: ${sector.performance}%`)
        .join('\n')}
      
      Economic Events:
      ${formattedEconomicEvents}
      
      Please analyze these indicators and provide insights about:
      1. Overall market sentiment based on the Fear & Greed Index
      2. Strongest and weakest performing sectors
      3. Key economic indicators and their implications (focus on high-impact events marked with 🔴)
      4. Potential opportunities or risks based on the economic data
      Limit the response to 4-5 sentences.
    `;

    let attempt = 0;
    let responseGenerated = false;
    let lastError: Error | null = null;

    while (attempt < maxRetries && !responseGenerated) {
      try {
        // Use Promise.race to get the first successful response from primary APIs
        const completion = await Promise.race([
          deepseekOpenAI.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-reasoner",
            temperature: 0.7,
            max_tokens: 300,
          }).then(result => ({ model: "DeepSeek Reasoner", result })),
          
          chatgptOpenAI.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini", // or another available ChatGPT model
            temperature: 0.7,
            max_tokens: 300,
          }).then(result => ({ model: "GPT-4o-mini", result }))
        ]);

        if (completion.result.choices[0].message.content) {
          responseGenerated = true;
          return NextResponse.json({
            summary: completion.result.choices[0].message.content,
            model: completion.model
          });
        }
      } catch (apiError) {
        console.error(`Attempt ${attempt + 1} failed:`, apiError);
        lastError = apiError instanceof Error ? apiError : new Error(String(apiError));
      }

      if (!responseGenerated && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      attempt++;
    }

    // If primary APIs failed, try the fallback API
    if (!responseGenerated) {
      try {
        console.log('Primary APIs failed, trying fallback API...');
        const fallbackResponse = await callFallbackAPI(prompt);
        
        if (fallbackResponse.result.choices[0].message.content) {
          return NextResponse.json({
            summary: fallbackResponse.result.choices[0].message.content,
            model: fallbackResponse.model
          });
        }
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError);
        const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
        return NextResponse.json({ 
          error: "Failed to generate market summary from all available APIs",
          details: {
            primaryError: lastError?.message || 'Unknown error',
            fallbackError: errorMessage
          }
        }, { status: 500 });
      }
    }

    return NextResponse.json({ error: "Failed to generate market summary" }, { status: 500 });
  } catch (error) {
    console.error('Error generating market summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate market summary' },
      { status: 500 }
    );
  }
} 