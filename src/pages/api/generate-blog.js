import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const OPENAI_API_KEY = 'sk_openai_api_key';


console.log("🚀 Mistral AI: " , OPENAI_API_KEY);

const openai = new OpenAI({
  baseURL: "https://api-inference.huggingface.co/v1/",
  apiKey: OPENAI_API_KEY
});



const userInput = "Generate a blog about pickle ball in India";
const SYSTEM_PROMPT = `
You are the AI assistant expert in creating the websites in astro you need to work upon the thing that is
you have to consider you justaddthe imagesand MD format properly so thatgenerated blog the super efficient and highly readable
You are a professional blog architect.

Generate comprehensive blog posts with these elements:

user Came and Enter the Prompt : userInput
your Task is To create the Blog 

1. **Blog Content**:
- Catchy SEO-optimized title
- Introduction with hook (<100 words)
- 3-5 sections with H2/H3 headers
- Data-supported arguments
- Conclusion with actionable takeaways

2. **Image Proposals**:
[Propose 3-5 images with:
• Visual description
• Placement context
• Alt-text draft
• Source type (CC0/Commercial)]


3. **Analytical Thoughts**:
- Cultural implications
- Industry impact analysis
- Future trend predictions

Format output in Markdown with clear section dividers. Prioritize India-specific context.


Example: 
---
title   : "The Essential Rules of Pickleball Every Beginner Should Know"
date : '2023-08-01'
description : 'Pickleball Guide'

---
## The Basics of Pickleball

Pickleball combines elements of tennis, badminton, and ping-pong. Here are the key rules:

### The Serve:
- Must be underhand
- Paddle contact below waist level
- Serve diagonally to opponent's service court

### The Kitchen (Non-Volley Zone):
- 7-foot area on both sides of the net
- Players cannot volley while standing in this zone
- You can enter to play a bounced ball

### Scoring:
- Only serving team can score points
- Games typically played to 11 points (win by 2)
'
`;

const chatCompletion = await openai.chat.completions.create({
	model: "mistralai/Mistral-Nemo-Instruct-2407",
	messages: [
        {
			role: "system",
			content: SYSTEM_PROMPT
		},
		{
			role: "user",
			content: userInput
		}
	],
	max_tokens: 500
});

console.log("✨ Mistral AI: " , chatCompletion.choices[0].message.content);

const blogContent = chatCompletion.choices[0].message.content;

// Create filename (you might want to generate a unique name)
const fileName = `blog-post-${Date.now()}.md`;
const blogDirectory = path.join(process.cwd(),'..' , 'generated-blog');

// Create directory if it doesn't exist
if (!fs.existsSync(blogDirectory)) {
  fs.mkdirSync(blogDirectory, { recursive: true });
}

// Write file to blog directory
const filePath = path.join(blogDirectory, fileName);
fs.writeFileSync(filePath, blogContent);

console.log(`✅ Blog post saved to: ${filePath}`);