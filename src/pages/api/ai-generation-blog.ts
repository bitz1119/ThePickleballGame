import type { APIRoute } from "astro";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";


const SYSTEM_PROMPT_TITLE = `Generate a single, highly optimized blog title based on the provided keyword(s) to maximize search engine ranking (SEO). Ensure the title is:  

- Compelling and click-worthy  
- Naturally incorporates the target keyword(s)  
- Within 55-60 characters for optimal SEO performance  
- Never Generate the Alternative Title
- Clear, relevant, and engaging for readers  

Example input: **'best productivity apps 2024'**  
Example output: **'10 Best Productivity Apps in 2024 to Supercharge Your Workflow'**  

Now, generate a title based on the given keyword(s).`;


const SYSTEM_PROMPT_DESCRIPTION = `
"You are an expert SEO content writer skilled in crafting engaging, keyword-rich blog descriptions that drive organic traffic. Your task is to generate compelling blog descriptions optimized for search engines while maintaining a natural, reader-friendly tone.  

- make sure to write whole description in 1 paragraph.
- Include relevant **primary and secondary keywords** naturally.  
- Keep the description **concise (100-150 characters)** for meta description purposes.  
- Write in a way that encourages **click-throughs (CTR)** by creating curiosity or offering a clear value proposition.  
- Ensure the description accurately represents the blog content while using **actionable language** (e.g., ‘Discover,’ ‘Learn,’ ‘Explore,’ ‘Uncover’).  
- Avoid keyword stuffing but make sure the keywords are strategically placed for **SEO impact**.  
- Use a tone that aligns with the blog’s target audience (professional, casual, informative, or persuasive).  

Generate a high-quality, SEO-friendly blog description based on the following input:**  

**[Insert Blog Title & Brief Summary Here]**  `;

const SYSTEM_PROMPT_BLOG_STRUCTURE = `
Generate a structured blog outline in **JSON format** about Pickleball. The blog should be divided into **chapters**, each covering a different aspect of the sport. Each chapter should have **multiple topics** related to its theme. The structure should include:  

- user gives you title your Task is to Generate the 
  Blog structure.
- **Title**: The blog’s main title.  
- **Chapters**: A list of chapters, each with a unique **number** and **title**.  
 - **Topics**: A list of topics under each chapter, each with a **title**.  

---

Example input: Provide ONLY a valid JSON object with chapters and topics. Ensure proper JSON formatting. Title :  Pickleball in Arunachal Pradesh: A Journey to the Top Courts & Tournaments

Example output: 

{
  "title": "The Ultimate Guide to Pickleball: Rules, Techniques, and Strategies",
  "chapters": [
    {
      "number": 1,
      "title": "Introduction to Pickleball",
      "topics": [
        {"title": "What is Pickleball?"},
        {"title": "A Brief History of Pickleball"},
        {"title": "Why Pickleball is Growing in Popularity"}
      ]
    },
    {
      "number": 2,
      "title": "Pickleball Equipment and Court Setup",
      "topics": [
        {"title": "Choosing the Right Pickleball Paddle"},
        {"title": "Types of Pickleballs and Their Differences"},
        {"title": "Pickleball Court Dimensions and Setup"}
      ]
    },
    {
      "number": 3,
      "title": "Pickleball Rules and Scoring",
      "topics": [
        {"title": "Basic Rules of Pickleball"},
        {"title": "How to Score in Pickleball"},
        {"title": "Understanding the 'Kitchen' Rule"}
      ]
    },
    {
      "number": 4,
      "title": "Essential Techniques for Beginners",
      "topics": [
        {"title": "Mastering the Pickleball Serve"},
        {"title": "How to Control the Ball with Dinks"},
        {"title": "The Importance of Footwork in Pickleball"}
      ]
    },
    {
      "number": 5,
      "title": "Advanced Strategies and Game Play",
      "topics": [
        {"title": "How to Play Doubles Effectively"},
        {"title": "Attacking vs. Defending Strategies"},
        {"title": "Common Mistakes and How to Avoid Them"}
      ]
    },
    {
      "number": 6,
      "title": "Health Benefits and Pickleball Community",
      "topics": [
        {"title": "Physical and Mental Benefits of Playing Pickleball"},
        {"title": "Finding Pickleball Tournaments and Clubs"},
        {"title": "Pickleball for Seniors: Why It's a Great Sport"}
      ]
    }
  ]
}

This blog outline **covers all key aspects of Pickleball**, making it engaging for both **beginners and experienced players**. Would you like any refinements or additions? 🚀`;


const openai = new OpenAI({
  baseURL: "https://api-inference.huggingface.co/v1/",
  apiKey: import.meta.env.OPENAI_API_KEY,
});

const TopicSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
});

const ChapterSchema = z.object({
  number: z.number(),
  title: z.string(),
  topics: z.array(TopicSchema),
});

const BlogSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  chapters: z.array(ChapterSchema),
  outputDir: z.string().optional().default("./src/pages/generated-blog"),
});

type BlogStructure = z.infer<typeof BlogSchema>;

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractJSON(content: string | undefined): string {
  if (!content) return "{}";

  const jsonMatches = content.match(/\{[\s\S]*?\}/g);

  if (jsonMatches) {
    for (const jsonStr of jsonMatches) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.chapters && Array.isArray(parsed.chapters)) {
          return jsonStr;
        }
      } catch (error) {
        console.log("JSON Parsing attempt failed:", error);
      }
    }
  }

  return "{}";
}

async function generateBlogTitle(topic: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_TITLE,
        },
        {
          role: "user",
          content: `Topic: ${topic}`,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || `Exploring ${topic}`;
  } catch (error) {
    console.error("Title generation error:", error);
    return `Insights into ${topic}`;
  }
}

async function generateBlogDescription(title: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_DESCRIPTION,
        },
        {
          role: "user",
          content: `Title: ${title}`,
        },
      ],
      max_tokens: 100,
      temperature: 0.6,
    });

    return (
      response.choices[0].message.content?.trim() ||
      "An insightful exploration of key topics."
    );
  } catch (error) {
    console.error("Description generation error:", error);
    return "Exploring important insights and perspectives.";
  }
}

// async function createBlogStructure(title: string) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: "mistralai/Mistral-Nemo-Instruct-2407",
//       messages: [
//         {
//           role: "system",
//           content: SYSTEM_PROMPT_BLOG_STRUCTURE,
//         },
//         {
//           role: "user",
//           content: `Generate a strict JSON structure for a blog about '${title}':`,
//         },
//       ],
//       temperature: 0.7,
//       max_tokens: 500,
//       response_format: { type: "json_object" },
//     });

//     const rawContent = response.choices[0].message.content || "{}";
//     console.log("Raw Response Content:", rawContent);

//     const cleanJSON = extractJSON(rawContent);
//     console.log("Clean JSON:", cleanJSON);

//     const structure = JSON.parse(cleanJSON);
//     console.log("Parsed Structure:", JSON.stringify(structure, null, 2));

//     return BlogSchema.parse({
//       title,
//       outputDir: "./src/pages/generated-blog",
//       chapters: (structure.chapters || []).map(
//         (chapter: any, index: number) => ({
//           number: chapter.number || index + 1,
//           title: chapter.title || `Chapter ${index + 1}`,
//           topics: (chapter.topics || []).map((t: any) => ({
//             title: typeof t === "string" ? t : t.title || `Topic ${index + 1}`,
//             content: "",
//           })),
//         })
//       ),
//     });
//   } catch (error) {
//     console.error("Blog Structure Generation Full Error:", error);

//     return {
//       title,
//       outputDir: "./src/pages/generated-blog",
//       chapters: Array.from({ length: 6 }, (_, i) => ({
//         number: i + 1,
//         title: `Chapter ${i + 1}`,
//         topics: [
//           { title: `Topic 1 for Chapter ${i + 1}`, content: "" },
//           { title: `Topic 2 for Chapter ${i + 1}`, content: "" },
//         ],
//       })),
//     };
//   }
// }


function getTopicPrefix(index: number): string {
  const prefixes = [
    "Understanding",
    "Exploring",
    "Mastering",
    "Implementing",
    "Analyzing",
    "Deep Dive into"
  ];
  return prefixes[index % prefixes.length];
}

// Update the createBlogStructure function without forcing an empty description
async function createBlogStructure(title: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT_BLOG_STRUCTURE,
        },
        {
          role: "user",
          content: `Generate a strict JSON structure for a blog about '${title}'`,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0].message.content || "{}";
    console.log("Raw Response Content:", rawContent);

    const cleanJSON = extractJSON(rawContent);
    console.log("Clean JSON:", cleanJSON);

    const structure = JSON.parse(cleanJSON);
    console.log("Parsed Structure:", JSON.stringify(structure, null, 2));

    // Don't include description in initial structure
    return BlogSchema.parse({
      title,
      outputDir: "./src/pages/generated-blog",
      chapters: structure.chapters.map((chapter) => ({
        number: chapter.number,
        title: chapter.title,
        topics: chapter.topics.map((topic) => ({
          title: topic.title,
          content: topic.content || "",
        })),
      })),
    });
  } catch (error) {
    console.error("Blog Structure Generation Full Error:", error);
    
    const generateFallbackStructure = (title: string) => {
      const aspects = [
        "Introduction and Fundamentals",
        "Core Concepts",
        "Advanced Principles",
        "Practical Applications",
        "Case Studies",
        "Future Trends",
        "Best Practices",
        "Expert Insights"
      ];
      
      return {
        title,
        outputDir: "./src/pages/generated-blog",
        chapters: aspects.map((aspect, i) => ({
          number: i + 1,
          title: `${aspect} of ${title}`,
          topics: Array.from({ length: 4 }, (_, j) => ({
            title: `${getTopicPrefix(j)} ${aspect.slice(0, -1)} - ${title}`,
            content: "",
          })),
        })),
      };
    };

    return generateFallbackStructure(title);
  }
}

async function generateTopicContent(
  topic: any,
  chapter: any,
  blog: any
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        {
          role: "system",
          content: "Generate detailed, informative content for a blog topic. content Length: 2500 words, also include a summary at the end, Always Consider the SEO of the topic for implementation organic search.",
        },
        {
          role: "user",
          content: `Blog Title: ${blog.title}
          Chapter: ${chapter.title}
          Topic: ${topic.title}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return (
      response.choices[0].message.content?.trim() ||
      "Content generation failed."
    );
  } catch (error) {
    console.error("Topic content generation error:", error);
    return `Unable to generate content for ${topic.title}`;
  }
}

async function writeBlogToMarkdown(blog: any): Promise<string> {
  const outputDir = path.resolve(blog.outputDir);
  await fs.mkdir(outputDir, { recursive: true });

  const sanitizedTitle = sanitizeFilename(blog.title);
  const filename = `${sanitizedTitle}.md`;
  const filePath = path.join(outputDir, filename);

  let markdownContent = `# ${blog.title}\n\n`;
  if (blog.description) {
    markdownContent += `## Description\n${blog.description}\n\n`;
  }

  for (const chapter of blog.chapters) {
    markdownContent += `## ${chapter.title}\n\n`;

    for (const topic of chapter.topics) {
      markdownContent += `### ${topic.title}\n\n`;
      markdownContent += `${topic.content}\n\n`;
    }
  }

  await fs.writeFile(filePath, markdownContent);
  return filePath;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { topic, outputDir = "./src/pages/generated-blog" } =
      await request.json();

    if (!import.meta.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Hugging Face API key not found",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const title = await generateBlogTitle(topic);
    console.log("✨Generated Title:", title);
    const description = await generateBlogDescription(title);
    console.log("✨Generated Description:", description);
    const blog = await createBlogStructure(title);
    console.log("✨Generated Blog Structure:", blog);

    const blogWithDescription: BlogStructure = {
      ...blog,
      description,
      outputDir
    };

    for (const chapter of blog.chapters) {
      for (const topic of chapter.topics) {
        topic.content = await generateTopicContent(topic, chapter, blogWithDescription);
      }
    }

    const outputPath = await writeBlogToMarkdown(blog);

    return new Response(
      JSON.stringify({
        message: "Blog generated successfully",
        path: outputPath,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Blog generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

