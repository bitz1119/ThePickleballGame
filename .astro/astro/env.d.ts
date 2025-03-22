declare module 'astro:env/client' {
	
}

declare module 'astro:env/server' {
	export const OPENAI_API_KEY: string;	


	export const getSecret: (key: string) => string | undefined;
}
