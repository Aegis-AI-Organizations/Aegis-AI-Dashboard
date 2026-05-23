declare global {
  interface Window {
    __RUNTIME_CONFIG__?: {
      API_GATEWAY_URL?: string;
      DOCS_BASE_URL?: string;
    };
  }
}

export const config = {
  apiGatewayUrl:
    window.__RUNTIME_CONFIG__?.API_GATEWAY_URL ||
    import.meta.env.VITE_API_URL ||
    "/api",
  docsBaseUrl:
    window.__RUNTIME_CONFIG__?.DOCS_BASE_URL ||
    import.meta.env.VITE_DOCS_URL ||
    "https://aegis-ai-organizations.github.io/Aegis-AI-Documentation",
};
