import type { APIRoute } from "astro";
import OpenAI from "openai";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

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
          content: "Generate an engaging blog title based on the given topic.Title Should not content",
        },
        {
          role: "user",
          content: `Topic: ${topic}`,
        },
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    console.log("generated title:", response.choices[0].message.content?.trim());

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
          content: "Create a brief, compelling blog description.",
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

async function createBlogStructure(title: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "mistralai/Mistral-Nemo-Instruct-2407",
      messages: [
        {
          role: "system",
          content:
            "Provide ONLY a valid JSON object with chapters and topics. Ensure proper JSON formatting.",
        },
        {
          role: "user",
          content: `Generate a strict JSON structure for a blog about '${title}':
{
  "chapters": [
    {
      "number": 1,
      "title": "First Chapter Title",
      "topics": [
        {"title": "First Topic"},
        {"title": "Second Topic"}
      ]
    },
    {
      "number": 2,
      "title": "Second Chapter Title", 
      "topics": [
        {"title": "Third Topic"},
        {"title": "Fourth Topic"}
      ]
    }
  ]
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0].message.content || "{}";
    console.log("Raw Response Content:", rawContent);

    const cleanJSON = extractJSON(rawContent);
    console.log("Clean JSON:", cleanJSON);

    const structure = JSON.parse(cleanJSON);
    console.log("Parsed Structure:", JSON.stringify(structure, null, 2));

    return BlogSchema.parse({
      title,
      outputDir: "./src/pages/generated-blog",
      chapters: (structure.chapters || []).map(
        (chapter: any, index: number) => ({
          number: chapter.number || index + 1,
          title: chapter.title || `Chapter ${index + 1}`,
          topics: (chapter.topics || []).map((t: any) => ({
            title: typeof t === "string" ? t : t.title || `Topic ${index + 1}`,
            content: "",
          })),
        })
      ),
    });
  } catch (error) {
    console.error("Blog Structure Generation Full Error:", error);

    return {
      title,
      outputDir: "./src/pages/generated-blog",
      chapters: Array.from({ length: 6 }, (_, i) => ({
        number: i + 1,
        title: `Chapter ${i + 1}`,
        topics: [
          { title: `Topic 1 for Chapter ${i + 1}`, content: "" },
          { title: `Topic 2 for Chapter ${i + 1}`, content: "" },
        ],
      })),
    };
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
    const description = await generateBlogDescription(title);
    const blog = await createBlogStructure(title);

    blog.description = description;
    blog.outputDir = outputDir;

    for (const chapter of blog.chapters) {
      for (const topic of chapter.topics) {
        topic.content = await generateTopicContent(topic, chapter, blog);
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
