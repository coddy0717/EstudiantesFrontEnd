// env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    readonly GEMINI_API_KEY: string;
    readonly NEXT_PUBLIC_GEMINI_API_KEY?: string;
    readonly NEXT_PUBLIC_API_URL: string;
  }
}