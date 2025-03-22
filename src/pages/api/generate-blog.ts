import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import type { APIRoute } from 'astro';

console.log("process.cwd() : " , process.cwd());
console.log('OPENAI_API_KEY:', import.meta.env.OPENAI_API_KEY);


export const  POST : APIRoute= async ({ request }) => {
  const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY;
  const BLOG_DIR = path.join(process.cwd(), 'src', 'pages', 'generated-blog');

  try {
  const { userInput } = await request.json();
	console.log("userInput : " , request.json());
    
    const openai = new OpenAI({
      baseURL: "https://api-inference.huggingface.co/v1/",
      apiKey: OPENAI_API_KEY
    });

    const SYSTEM_PROMPT = `
You are an expert AI assistant for creating blog posts in Astro framework format. Follow these strict rules:

1. Front Matter Formatting:
---
title: "Your Title Text Without Any Formatting"
date: 'YYYY-MM-DD'
description: "Plain text description"
layout: ../../layouts/Layout.astro
---
• No ** or any markdown in title/date/description/layout
• Space after colon in front matter
• Date in ISO format

2. Content Requirements:
- Use ## for H2 and ### for H3 headers
- Maintain 75-100 word paragraph breaks
- India-specific examples where applicable
- CC0 image sources preferred

3. Prohibited Formatting:
❌ **Bold** in title/date/description/layout
❌ Markdown in front matter
❌ Unsourced images

Example of Correct Format:

---
title: "Sustainable Farming Techniques for Indian Agriculture"
date: '2024-03-15'
description: "Modern eco-friendly farming practices"
layout: ../../layouts/Layout.astro
---

## Water Conservation Methods

### Micro-Irrigation Systems
Drip irrigation adoption in Punjab increased yields by 40% while reducing water usage...

[Image Proposal 1]
• Visual: Farmer inspecting drip irrigation lines
• Placement: After first paragraph
• Alt-text: "Farm worker checking drip irrigation system in Punjab field"
• Source: CC0 agricultural photo database

Analytical Insight: The National Water Mission estimates...

// Key Requirements Reminder
- Triple-check front matter formatting
- Verify image licensing information
- Include India-specific data points
- Prevent markdown usage in title/date/description
`;

    const completion = await openai.chat.completions.create({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userInput }
      ],
      max_tokens: 500
    });

    const blogContent = completion.choices[0].message.content;

    console.log("✨ blogContent : " , blogContent);
    const slug = blogContent.match(/title\s*:\s*"([^"]+)"/i)[1]
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');

    const fileName = `${slug}.md`;
    const filePath = path.join(BLOG_DIR, fileName);

    if (!fs.existsSync(BLOG_DIR)) {
      fs.mkdirSync(BLOG_DIR, { recursive: true });
    }

    fs.writeFileSync(filePath, blogContent);

    return new Response(JSON.stringify({
      success: true,
      slug,
      path: filePath
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
  console.error("error : " , error);
    return new Response(JSON.stringify({
      success: false,
      error: error
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}