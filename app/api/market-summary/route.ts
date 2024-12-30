import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
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

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 200,
    });

    return NextResponse.json({ 
      summary: completion.choices[0].message.content 
    });

  } catch (error) {
    console.error('Error generating market summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate market summary' },
      { status: 500 }
    );
  }
} 