import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt =
      body.prompt ||
      body.message ||
      (Array.isArray(body.messages) ? body.messages[body.messages.length - 1]?.content : undefined);

    if (!prompt) {
      return Response.json(
        { error: 'Nenhuma mensagem ou prompt fornecido.' },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return Response.json({
      text: response.text,
      message: response.text,
    });
  } catch (error: any) {
    console.error('Erro na API do Gemini:', error);
    return Response.json(
      { error: error?.message || 'Ocorreu um erro ao processar a mensagem.' },
      { status: 500 }
    );
  }
}
