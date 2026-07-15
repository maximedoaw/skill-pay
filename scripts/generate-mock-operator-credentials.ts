import { randomBytes } from "crypto";

function generate(prefix: string) {
  return `${prefix}_${randomBytes(16).toString("hex")}`;
}

console.log("# Colle ces lignes dans .env.local — valeurs auto-générées, pas des clés opérateur réelles");
console.log(`ORANGE_CLIENT_ID=${generate("orange_client")}`);
console.log(`ORANGE_CLIENT_SECRET=${generate("orange_secret")}`);
console.log(`MTN_API_USER=${generate("mtn_user")}`);
console.log(`MTN_API_KEY=${generate("mtn_key")}`);
console.log(`MTN_SUBSCRIPTION_KEY=${generate("mtn_subkey")}`);