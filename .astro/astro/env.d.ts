declare module 'astro:env/client' {
	export const OPEN_AI_API_KEY: string;	

}

declare module 'astro:env/server' {
	

	export const getSecret: (key: string) => string | undefined;
}
