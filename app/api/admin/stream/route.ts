export const runtime = "edge";

export async function GET(req: Request) {
  let timer: any;

  const stream = new ReadableStream({
    start(controller) {
      // Message de connexion initiale
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode("data: connected\n\n"));

      // Ping toutes les 3.5 secondes pour dire au client de re-fetch (en fallback du refetchInterval)
      timer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode("data: ping\n\n"));
        } catch (e) {
          clearInterval(timer);
        }
      }, 3500);
    },
    cancel() {
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
