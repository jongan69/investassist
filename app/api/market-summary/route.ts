import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

let deepseekOpenAI = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

let chatgptOpenAI = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const maxRetries = 2; // Maximum number of retry attempts
  const retryDelay = 1000; // Delay between retries in milliseconds

  try {
    const { fearGreedValue, sectorPerformance } = await req.json();

    const prompt = `
      As a market analyst, provide a concise summary of the current market conditions based on the following data:
      
      Fear & Greed Index: ${fearGreedValue}
      
      Sector Performance:
      ${sectorPerformance
        .map((sector: { sector: any; performance: any; }) => `${sector.sector}: ${sector.performance}%`)
        .join('\n')}
      
      Please analyze these indicators and provide insights about:
      1. Overall market sentiment
      2. Strongest and weakest performing sectors
      3. Potential opportunities or risks
      Limit the response to 3-4 sentences.
    `;

    let attempt = 0;
    let responseGenerated = false;

    while (attempt < maxRetries && !responseGenerated) {
      try {
        // Use Promise.race to get the first successful response
        const completion = await Promise.race([
          deepseekOpenAI.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-reasoner",
            temperature: 0.7,
            max_tokens: 200,
          }).then(result => ({ model: "DeepSeek Reasoner", result })),
          
          chatgptOpenAI.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-4o-mini", // or another available ChatGPT model
            temperature: 0.7,
            max_tokens: 200,
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
      }

      if (!responseGenerated && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      attempt++;
    }

    if (!responseGenerated) {
      return NextResponse.json({ error: "Failed to generate market summary" }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating market summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate market summary' },
      { status: 500 }
    );
  }
} 