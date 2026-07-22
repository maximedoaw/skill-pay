import { pgTable, uuid, varchar, bigint, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const merchantStatus = pgEnum("merchant_status", ["PENDING", "ACTIVE", "SUSPENDED", "CLOSED", "REJECTED"]);
export const documentStatus = pgEnum("document_status", ["PENDING", "APPROVED", "REJECTED"]);
export const operatorEnum = pgEnum("operator", ["ORANGE_MONEY", "MTN_MOMO"]);
export const transactionStatus = pgEnum("transaction_status", [
  "INITIATED", "PENDING", "SUCCESSFUL", "FAILED", "EXPIRED", "REFUNDED",
]);

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().default("anonymous"),
  clerkUserId: varchar("clerk_user_id", { length: 128 }).notNull().unique(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  phoneVerified: boolean("phone_verified").notNull().default(false), // via Twilio Verify
  apiKeyPublic: varchar("api_key_public", { length: 64 }).notNull().unique(),
  apiSecretHash: varchar("api_secret_hash", { length: 255 }).notNull(),
  webhookUrl: varchar("webhook_url", { length: 512 }),
  smsAlertsEnabled: boolean("sms_alerts_enabled").notNull().default(false),
  status: merchantStatus("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const merchantDocuments = pgTable("merchant_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id),
  type: varchar("type", { length: 50 }).notNull(), // cni, rccm, other
  name: varchar("name", { length: 255 }).notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  status: documentStatus("status").notNull().default("PENDING"),
  rejectionReason: varchar("rejection_reason", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const merchantsRelations = relations(merchants, ({ many }) => ({
  documents: many(merchantDocuments),
}));

export const merchantDocumentsRelations = relations(merchantDocuments, ({ one }) => ({
  merchant: one(merchants, {
    fields: [merchantDocuments.merchantId],
    references: [merchants.id],
  }),
}));

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id").notNull().references(() => merchants.id),
  operator: operatorEnum("operator").notNull(),
  operatorRef: varchar("operator_ref", { length: 128 }), // payToken (Orange) ou X-Reference-Id (MTN)
  externalId: varchar("external_id", { length: 128 }).notNull(),
  amount: bigint("amount", { mode: "number" }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("XAF"),
  payerMsisdn: varchar("payer_msisdn", { length: 20 }).notNull(),
  status: transactionStatus("status").notNull().default("INITIATED"),
  statusReason: varchar("status_reason", { length: 128 }),
  webhookDelivered: boolean("webhook_delivered").notNull().default(false),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const operatorPrefixes = pgTable("operator_prefixes", {
  id: uuid("id").primaryKey().defaultRandom(),
  prefix: varchar("prefix", { length: 6 }).notNull(),
  operator: operatorEnum("operator").notNull(),
});

// État interne du simulateur — représente le "système externe" Orange/MTN,
// volontairement séparé de `transactions` (le vrai Orange aurait aussi sa
// propre base, à laquelle tu n'as jamais accès directement).
export const mockOperatorTransactions = pgTable("mock_operator_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  operator: operatorEnum("operator").notNull(),
  providerRef: varchar("provider_ref", { length: 128 }).notNull().unique(), // payToken ou X-Reference-Id
  notifyUrl: varchar("notify_url", { length: 512 }), // utilisé par le simulateur Orange
  status: transactionStatus("status").notNull().default("PENDING"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});