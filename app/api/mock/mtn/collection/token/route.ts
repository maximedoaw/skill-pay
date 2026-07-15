export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const subKey = req.headers.get("Ocp-Apim-Subscription-Key");

  const expectedAuth = `Basic ${Buffer.from(
    `${process.env.MTN_API_USER}:${process.env.MTN_API_KEY}`
  ).toString("base64")}`;

  if (authHeader !== expectedAuth || subKey !== process.env.MTN_SUBSCRIPTION_KEY) {
    return new Response(null, { status: 401 });
  }

  return Response.json({
    access_token: `mock_${crypto.randomUUID()}`,
    token_type: "Bearer",
    expires_in: 3600,
  });
}