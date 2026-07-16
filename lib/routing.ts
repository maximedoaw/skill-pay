const OPERATOR_PREFIXES: Array<{ prefix: string; operator: "ORANGE_MONEY" | "MTN_MOMO" }> = [
  { prefix: "23769", operator: "ORANGE_MONEY" },
  { prefix: "23765", operator: "MTN_MOMO" },
  { prefix: "23766", operator: "MTN_MOMO" },
  { prefix: "23767", operator: "MTN_MOMO" },
  { prefix: "23768", operator: "ORANGE_MONEY" },
  { prefix: "23770", operator: "ORANGE_MONEY" },
  { prefix: "23771", operator: "ORANGE_MONEY" },
  { prefix: "23775", operator: "MTN_MOMO" },
  { prefix: "23776", operator: "MTN_MOMO" },
  { prefix: "23777", operator: "MTN_MOMO" },
  { prefix: "23778", operator: "MTN_MOMO" },
  { prefix: "23779", operator: "MTN_MOMO" },
];

export async function resolveOperator(msisdn: string) {
  const normalized = msisdn.replace(/\D/g, "");

  if (!normalized.startsWith("237") || normalized.length < 12) {
    return null;
  }

  const prefix = normalized.slice(0, 5);
  const match = OPERATOR_PREFIXES.find((entry) => prefix.startsWith(entry.prefix.slice(0, 5)) || entry.prefix === prefix);

  return match?.operator ?? null;
}
