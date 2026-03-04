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
    import.meta.env.VITE_API_GATEWAY_URL ||
    "",
};
