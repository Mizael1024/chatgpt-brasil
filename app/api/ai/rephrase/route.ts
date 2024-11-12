import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { text, type } = await request.json();

    let prompt = '';
    switch (type) {
      case 'rephrase':
        prompt = `Reformule o seguinte texto mantendo o mesmo significado, mas usando palavras diferentes: "${text}"`;
        break;
      case 'simplify':
        prompt = `Simplifique o seguinte texto, tornando-o mais fácil de entender: "${text}"`;
        break;
      case 'expand':
        prompt = `Expanda o seguinte texto, adicionando mais detalhes e explicações: "${text}"`;
        break;
      case 'summarize':
        prompt = `Resuma o seguinte texto mantendo os pontos principais: "${text}"`;
        break;
      default:
        throw new Error('Tipo de reformulação inválido');
    }

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em reformulação de texto, mantendo o tom profissional e adequado ao contexto."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 500,
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Erro ao processar texto:', error);
    return NextResponse.json(
      { error: 'Erro ao processar texto' },
      { status: 500 }
    );
  }
}
