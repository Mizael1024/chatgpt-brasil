import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ARTICLE_PROMPT = `Write an article in Brazilian Portuguese (português do Brasil) following this exact HTML structure:

1. Start with an engaging introduction paragraph
2. Use proper heading hierarchy (H2, H3) for sections
3. Include structured data markup
4. Format the content following this template:

<h1>[Main Title]</h1>
<p>[Introduction paragraph with engaging hook and overview]</p>

<h2>[First Main Section]</h2>
<p>[Content with relevant information]</p>

<h3>[Subsection if needed]</h3>
<p>[Detailed explanation]</p>

<h2>[Second Main Section]</h2>
<p>[More content with facts and data]</p>

<h2>[Third Main Section]</h2>
<p>[Additional content]</p>

<h2>Conclusão</h2>
<p>[Concluding paragraph with key takeaways]</p>

Requirements:
- Write in clear, engaging Brazilian Portuguese
- Use proper HTML tags for structure
- Include relevant internal links using <a> tags
- Optimize headings for SEO
- Maintain E-E-A-T principles throughout
- Keep paragraphs concise and well-structured
- Use proper heading hierarchy (H1 -> H2 -> H3)

Topic/Keyword: `;

export async function POST(request: Request) {
  try {
    const { keyword } = await request.json();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert SEO content writer. Generate articles in Brazilian Portuguese with proper HTML structure, following Google's SEO guidelines. Include proper heading hierarchy, structured data, and semantic HTML markup.`
        },
        {
          role: "user",
          content: ARTICLE_PROMPT + keyword
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;

    // Processar o conteúdo para garantir formatação correta
    const processedContent = content
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');

    return NextResponse.json({ 
      content: processedContent 
    });
  } catch (error) {
    console.error('Erro ao gerar artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar artigo' },
      { status: 500 }
    );
  }
}
