export type FieldKind = "text" | "uuid" | "phone" | "decimal" | "date";
export interface FieldSpec {
  name: string; label: string; kind: FieldKind; required?: boolean; help?: string;
  maxDecimals?: number; maxDigits?: number; maxLength?: number; pattern?: RegExp; min?: string;
}

export const UNIT_CREATE_FIELDS: FieldSpec[] = [
  { name: "unit_number", label: "Unit number", kind: "text", required: true, maxLength: 50 },
  { name: "base_rent", label: "Base rent (KES)", kind: "decimal", required: true, maxDecimals: 2, maxDigits: 12, min: "0" },
];
export const UNIT_PATCH_FIELDS: FieldSpec[] = UNIT_CREATE_FIELDS.map((field) => ({ ...field, required: false }));
export const TENANT_CREATE_FIELDS: FieldSpec[] = [
  { name: "unit_id", label: "Unit", kind: "uuid", required: true },
  { name: "full_name", label: "Full name", kind: "text", required: true, maxLength: 255 },
  { name: "primary_phone", label: "Phone (254XXXXXXXXX)", kind: "phone", required: true, pattern: /^254\d{9}$/, help: "Format: 254712345678" },
  { name: "lease_start_date", label: "Lease start date", kind: "date", required: true },
  { name: "deposit_amount", label: "Deposit (KES)", kind: "decimal", maxDecimals: 2, maxDigits: 12, min: "0", help: "Optional; defaults to KES 0.00." },
  { name: "id_number", label: "Government ID number (optional)", kind: "text", maxLength: 50, help: "Not returned by the API after creation." },
];
export const INVOICE_CREATE_FIELDS: FieldSpec[] = [
  { name: "unit_id", label: "Unit ID", kind: "uuid", required: true },
  { name: "tenant_id", label: "Tenant ID", kind: "uuid", required: true },
  { name: "invoice_number", label: "Invoice number", kind: "text", required: true, maxLength: 100 },
  { name: "billing_month", label: "Billing month", kind: "date", required: true },
  { name: "rent_amount", label: "Rent amount (KES)", kind: "decimal", required: true, maxDecimals: 2, maxDigits: 12, min: "0" },
  { name: "water_amount", label: "Water amount (KES)", kind: "decimal", maxDecimals: 2, maxDigits: 12, min: "0" },
  { name: "garbage_amount", label: "Garbage amount (KES)", kind: "decimal", maxDecimals: 2, maxDigits: 10, min: "0" },
  { name: "security_amount", label: "Security amount (KES)", kind: "decimal", maxDecimals: 2, maxDigits: 10, min: "0" },
  { name: "due_date", label: "Due date", kind: "date", required: true },
];
export const RESOLVE_TENANT_FIELD = "tenant_id" as const;
export const PAGINATION = { limit: "limit", offset: "offset", defaultLimit: 50, maxLimit: 100 } as const;
export const LEDGER_FILTERS = [
  { param: "payment_transaction_id", label: "Payment ID", kind: "uuid" },
  { param: "tenant_id", label: "Tenant ID", kind: "uuid" },
  { param: "invoice_id", label: "Invoice ID", kind: "uuid" },
  { param: "unit_id", label: "Unit ID", kind: "uuid" },
  { param: "property_id", label: "Property ID", kind: "uuid" },
  { param: "receipt", label: "Receipt", kind: "text", maxLength: 100 },
  { param: "created_from", label: "Created from (with timezone)", kind: "date" },
  { param: "created_to", label: "Created to (with timezone)", kind: "date" },
] as const;
