type CorsResponse = {
  setHeader(name: string, value: string): void;
};

export function applyCorsHeaders(
  response: CorsResponse,
  allowMethods: "GET, OPTIONS" | "POST, OPTIONS",
) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.setHeader("Access-Control-Allow-Methods", allowMethods);
}

