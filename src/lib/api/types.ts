import type { components, operations } from "./generated/schema";

export type Schema = components["schemas"];
export type Role = "LANDLORD" | "CARETAKER" | "TENANT";
export type Property = Schema["PropertyRead"];
export type Unit = Schema["UnitRead"];
export type Tenant = Schema["TenantRead"];
export type Invoice = Schema["InvoiceRead"];
export type Payment = Schema["PaymentTransactionRead"];
export type Allocation = Schema["PaymentAllocationRead"];
export type Credit = Schema["PaymentCreditRead"];
export type UnassignedPayment = Schema["UnassignedPaymentRead"];
export type Resolution = Schema["UnassignedPaymentResolutionRead"];
export type LedgerEntry = Schema["LedgerEntryRead"];
export type LandlordContext = Schema["LandlordContextRead"];
export type CaretakerContext = operations["get_caretaker_context_api_v1_bff_caretaker_me_get"]["responses"][200]["content"]["application/json"];
export type TenantContext = Tenant;
export type MembershipContext = LandlordContext | CaretakerContext | TenantContext;

type StringMoney<T, K extends keyof T> = Omit<T, K> & { [P in K]: string };
export type UnitCreate = { unit_number: string; base_rent: string; garbage_fee?: string; security_fee?: string; water_rate_per_unit?: string };
export type UnitPatch = Partial<UnitCreate>;
export type TenantCreate = Omit<Schema["TenantCreate"], "deposit_amount"> & { deposit_amount?: string; id_number?: string };
export type InvoiceCreate = Omit<Schema["InvoiceCreate"], "rent_amount" | "water_amount" | "garbage_amount" | "security_amount"> & {
  rent_amount: string; water_amount?: string; garbage_amount?: string; security_amount?: string;
};
export type ResolveUnassigned = Schema["UnassignedPaymentResolve"];

export interface Page<T> { items: T[]; total: number; limit: number; offset: number }

export interface PropertyVM { id: string; name: string; location: string; totalUnits: number; createdAt: string | null }
export interface UnitVM { id: string; propertyId: string; unitNumber: string; baseRent: string; garbageFee: string; securityFee: string; waterRatePerUnit: string; occupied: boolean; createdAt: string }
export interface TenantVM { id: string; unitId: string; fullName: string; primaryPhone: string; leaseStartDate: string; depositAmount: string; active: boolean; createdAt: string }
export interface InvoiceVM { id: string; invoiceNumber: string; billingMonth: string; tenantId: string; unitId: string; rentAmount: string; waterAmount: string; garbageAmount: string; securityAmount: string; totalAmount: string; dueDate: string; paid: boolean; createdAt: string }
export interface PaymentVM { id: string; tenantId: string; receipt: string; amount: string; method: string; status: string; createdAt: string; completedAt: string | null }
export interface AllocationVM { id: string; invoiceId: string; amount: string; status: string; createdAt: string; reversedAt: string | null }
export interface CreditVM { id: string; amount: string; availableAmount: string; status: string; createdAt: string; appliedAt: string | null }
export interface UnassignedPaymentVM { id: string; receipt: string; amount: string; payerPhone: string; payerName: string | null; invalidReference: string | null; createdAt: string | null }
export interface LedgerEntryVM { id: string; receipt: string | null; entryType: string; amount: string; paymentMethod: string; status: string; description: string; createdAt: string | null; unitId: string; tenantId: string | null; invoiceId: string | null; paymentId: string | null }
