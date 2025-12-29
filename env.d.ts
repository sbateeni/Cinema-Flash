
// Use interface augmentation to add API_KEY to the existing NodeJS.ProcessEnv
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    [key: string]: string | undefined;
  }
}
