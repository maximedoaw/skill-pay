export async function POST(req: Request) {
  const authHeader = req.headers.get("Authorization");
  const expected = `Basic ${Buffer.from(
    `${process.env.ORANGE_CLIENT_ID}:${process.env.ORANGE_CLIENT_SECRET}`
  ).toString("base64")}`;

  // Valide le handshake client_id/secret — avec les valeurs auto-générées de la section 8.0,
  // pas avec un vrai compte Orange.
  if (authHeader !== expected) {
    return Response.json({ code: "AUTH_001", message: "client_id ou client_secret invalide" }, { status: 401 });
  }

  return Response.json({
    access_token: `mock_${crypto.randomUUID()}`,
    token_type: "Bearer",
    expires_in: 3600,
  });
}