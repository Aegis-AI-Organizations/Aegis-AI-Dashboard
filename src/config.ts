declare global {
  interface Window {
    __RUNTIME_CONFIG__: {
      API_GATEWAY_URL: string;
    };
  }
}

export const config = {
  apiGatewayUrl:
    window.__RUNTIME_CONFIG__?.API_GATEWAY_URL ||
    import.meta.env.API_GATEWAY_URL ||
    "http://api.aegis.pre-alpha.local:32564",
};
