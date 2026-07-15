// scripts/set-admin-role.ts
// Exécuté une seule fois, manuellement, pour ton compte et celui de Julien.
// Usage : npx tsx scripts/set-admin-role.ts user_xxx
import { clerkClient } from "@clerk/nextjs/server";

async function main() {
  const userId = process.argv[2];
  if (!userId) throw new Error("Usage: tsx scripts/set-admin-role.ts <clerkUserId>");

  await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { role: "admin" },
  });

  console.log(`Rôle admin assigné à ${userId}`);
}

main();