"use client";
import { useParams } from "next/navigation";
import { DataState } from "@/components/DataState";
import { DateTimeEAT, Money, ReceiptCode } from "@/components/DesignSystem";
import { PageHeader } from "@/components/PageHeader";
import { ResourceDetails } from "@/components/ResourceDetails";
import { RoleGate } from "@/components/RoleGate";
import { useLoad } from "@/hooks/useLoad";
import { useReadyAuth } from "@/lib/auth/session";
export default function LedgerEntryPage() {
 const { id } = useParams<{id:string}>(); const {api}=useReadyAuth(); const {state,reload}=useLoad(()=>api.ledgerEntry(id),[api,id]);
 return <RoleGate roles={["LANDLORD"]}><PageHeader title="Ledger entry" back={{href:"/ledger",label:"Ledger"}}/><DataState state={state} onRetry={reload}>{(e)=><div className="panel"><ResourceDetails title="Entry details" fields={[{label:"Receipt",value:<ReceiptCode value={e.mpesa_receipt_number}/>},{label:"Type",value:e.entry_type},{label:"Amount",value:<Money value={e.amount}/>},{label:"Payment method",value:e.payment_method},{label:"Status",value:e.status},{label:"Description",value:e.description},{label:"Created",value:<DateTimeEAT value={e.created_at}/>},{label:"Unit ID",value:e.unit_id},{label:"Tenant ID",value:e.tenant_id},{label:"Invoice ID",value:e.invoice_id},{label:"Payment ID",value:e.payment_transaction_id}]}/></div>}</DataState></RoleGate>;
}
