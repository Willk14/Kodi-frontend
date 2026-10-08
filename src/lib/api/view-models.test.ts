import { describe, expect, it } from "vitest";
import type { Allocation, Credit, Invoice, LedgerEntry, Payment, Property, Tenant, UnassignedPayment, Unit } from "./types";
import { mapAllocation, mapCredit, mapInvoice, mapLedgerEntry, mapPayment, mapProperty, mapTenant, mapUnassignedPayment, mapUnit } from "./view-models";

// TEST FIXTURES ONLY. Synthetic IDs and dates below are not production records.
const property: Property = { id: "TEST-PROPERTY-ID", name: "Test Property", county: "Test County", town_location: "Test Town", total_units: 2, created_at: "2001-01-01T00:00:00Z" };
const unit: Unit = { id: "TEST-UNIT-ID", property_id: "TEST-PROPERTY-ID", unit_number: "TEST-UNIT", base_rent: "123.40", garbage_fee: "0.00", security_fee: "0.00", water_rate_per_unit: "0.00", is_occupied: false, created_at: "2001-01-01T00:00:00Z" };
const tenant: Tenant = { id: "TEST-TENANT-ID", unit_id: "TEST-UNIT-ID", full_name: "Test Fixture Tenant", primary_phone: "254700000001", lease_start_date: "2001-01-01", deposit_amount: "0.00", is_active: true, created_at: "2001-01-01T00:00:00Z" };
const invoice: Invoice = { id: "TEST-INVOICE-ID", unit_id: "TEST-UNIT-ID", tenant_id: "TEST-TENANT-ID", invoice_number: "TEST-INVOICE", billing_month: "2001-01-01", rent_amount: "123.40", water_amount: "0.00", garbage_amount: "0.00", security_amount: "0.00", total_amount: "123.40", due_date: "2001-01-10", is_paid: false, created_at: "2001-01-01T00:00:00Z" };
const payment: Payment = { id: "TEST-PAYMENT-ID", tenant_id: "TEST-TENANT-ID", mpesa_receipt_number: "TEST-RECEIPT", amount: "123.40", payment_method: "TEST-METHOD", status: "PENDING", created_at: "2001-01-01T00:00:00Z", completed_at: null };
const allocation: Allocation = { id: "TEST-ALLOCATION-ID", payment_transaction_id: "TEST-PAYMENT-ID", invoice_id: "TEST-INVOICE-ID", amount: "123.40", status: "PENDING", created_at: "2001-01-01T00:00:00Z", reversed_at: null };
const credit: Credit = { id: "TEST-CREDIT-ID", payment_transaction_id: "TEST-PAYMENT-ID", tenant_id: "TEST-TENANT-ID", amount: "123.40", available_amount: "23.40", status: "ACTIVE", created_at: "2001-01-01T00:00:00Z", applied_at: null };
const unassigned: UnassignedPayment = { id: "TEST-UNASSIGNED-ID", mpesa_receipt_number: "TEST-UNASSIGNED-RECEIPT", amount: "123.40", payer_phone: "254700000002", payer_name: "Test Fixture Payer", invalid_account_reference: "TEST-REF", created_at: "2001-01-01T00:00:00Z" };
const ledger: LedgerEntry = { id: "TEST-LEDGER-ID", unit_id: "TEST-UNIT-ID", tenant_id: "TEST-TENANT-ID", invoice_id: "TEST-INVOICE-ID", payment_transaction_id: "TEST-PAYMENT-ID", mpesa_receipt_number: "TEST-RECEIPT", entry_type: "TEST_ENTRY", amount: "123.40", payment_method: "TEST-METHOD", status: "PENDING", description: "Test fixture entry", created_at: "2001-01-01T00:00:00Z" };

describe("contract resource mappers", () => {
  it("maps property fields", () => expect(mapProperty(property)).toMatchObject({ name: "Test Property", location: "Test Town, Test County", totalUnits: 2 }));
  it("maps unit fields and preserves decimal strings", () => expect(mapUnit(unit)).toMatchObject({ baseRent: "123.40", propertyId: "TEST-PROPERTY-ID" }));
  it("maps tenant response fields without the create-only government ID", () => expect(mapTenant(tenant)).toMatchObject({ primaryPhone: "254700000001", depositAmount: "0.00" }));
  it("maps invoice component amounts without summing money", () => expect(mapInvoice(invoice)).toMatchObject({ rentAmount: "123.40", totalAmount: "123.40" }));
  it("maps payment response", () => expect(mapPayment(payment)).toMatchObject({ receipt: "TEST-RECEIPT", amount: "123.40" }));
  it("maps allocation response", () => expect(mapAllocation(allocation)).toMatchObject({ invoiceId: "TEST-INVOICE-ID", amount: "123.40" }));
  it("maps credit response", () => expect(mapCredit(credit)).toMatchObject({ amount: "123.40", availableAmount: "23.40" }));
  it("maps unassigned payment fields", () => expect(mapUnassignedPayment(unassigned)).toMatchObject({ payerPhone: "254700000002", invalidReference: "TEST-REF" }));
  it("maps ledger entry fields and preserves nullable IDs", () => expect(mapLedgerEntry({ ...ledger, tenant_id: null })).toMatchObject({ amount: "123.40", tenantId: null }));
});
