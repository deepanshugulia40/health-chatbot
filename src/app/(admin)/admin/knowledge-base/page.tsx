import type { Metadata } from "next";
import { DocumentsManager } from "@/components/admin/DocumentsManager";
import { PageHeader } from "@/components/admin/PageHeader";
import { ContentUnavailable } from "@/components/ContentUnavailable";
import { listDocuments, type AdminDocument } from "@/lib/admin/data";

export const metadata: Metadata = { title: "Knowledge base" };
export const dynamic = "force-dynamic";

export default async function KnowledgeBasePage() {
  let documents: AdminDocument[] | null = null;
  try {
    documents = await listDocuments();
  } catch (err) {
    console.error("[admin] documents failed:", err instanceof Error ? err.message : err);
  }

  return (
    <>
      <PageHeader
        title="Knowledge base"
        description="Documents the chatbot answers from. Only verified documents are searchable, so check each one against its source before verifying."
      />
      {documents === null ? <ContentUnavailable message="Could not load documents." /> : <DocumentsManager documents={documents} />}
    </>
  );
}
