import Document from "@/models/Document";
import StudentDocument from "@/models/StudentDocument";

type LegacyStudentDocument = {
  _id: { toString(): string };
  studentId: { toString(): string };
  type: "enrollment_card" | "admit_card" | "other";
  title?: string;
  fileName?: string;
  fileKey?: string;
  storageProvider?: "oracle" | "r2";
  mimeType?: string;
  size?: number;
  isPublished?: boolean;
  downloadAllowed?: boolean;
  lockReason?: string;
  uploadedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export async function backfillStudentDocumentsToDocuments(filter: Record<string, unknown> = {}) {
  const legacyDocuments = await StudentDocument.find(filter)
    .select(
      "_id studentId type title fileName fileKey storageProvider mimeType size isPublished downloadAllowed lockReason uploadedAt createdAt updatedAt"
    )
    .lean<LegacyStudentDocument[]>();

  const candidates = legacyDocuments.filter((document) => document.fileKey);
  if (candidates.length === 0) return 0;

  const existingDocuments = await Document.find({
    $or: [
      { _id: { $in: candidates.map((document) => document._id) } },
      { fileKey: { $in: candidates.map((document) => document.fileKey) } },
    ],
  })
    .select("_id fileKey")
    .lean<Array<{ _id: { toString(): string }; fileKey?: string }>>();

  const existingIds = new Set(existingDocuments.map((document) => document._id.toString()));
  const existingFileKeys = new Set(existingDocuments.map((document) => document.fileKey).filter(Boolean));

  const documentsToInsert = candidates.filter(
    (document) => !existingIds.has(document._id.toString()) && !existingFileKeys.has(document.fileKey)
  );

  const operations = documentsToInsert
    .map((document) => {
      const uploadedAt = document.uploadedAt || document.createdAt || new Date();
      const fileName = document.fileName || `${document.title || "document"}.pdf`;

      return {
        updateOne: {
          filter: { _id: document._id },
          update: {
            $setOnInsert: {
              _id: document._id,
              studentId: document.studentId,
              title: document.title || fileName,
              type: document.type,
              storageProvider: document.storageProvider || "r2",
              fileKey: document.fileKey,
              fileName,
              originalFileName: fileName,
              mimeType: document.mimeType || "application/pdf",
              fileSize: document.size || 0,
              isPublished: document.isPublished ?? true,
              requiresFeeClearance: document.type === "admit_card",
              // Legacy quick uploads defaulted this to false without an admin lock control.
              downloadAllowed: document.downloadAllowed === false && !document.lockReason ? true : document.downloadAllowed ?? true,
              uploadedBy: "StudentDocument backfill",
              createdAt: document.createdAt || uploadedAt,
            },
          },
          upsert: true,
        },
      };
    });

  const result = operations.length > 0 ? await Document.bulkWrite(operations, { ordered: false }) : null;
  const migrated = result?.upsertedCount || 0;
  let removedLegacy = 0;

  try {
    const deleteResult = await StudentDocument.deleteMany({ _id: { $in: candidates.map((document) => document._id) } });
    removedLegacy = deleteResult.deletedCount || 0;
  } catch (error) {
    console.error("[documents:backfill] failed to remove migrated legacy studentdocuments", error);
  }

  if (migrated > 0 || removedLegacy > 0) {
    console.info("[documents:backfill] migrated legacy studentdocuments", {
      migrated,
      removedLegacy,
      sourceModel: "StudentDocument",
      sourceCollection: StudentDocument.collection.name,
      targetModel: "Document",
      targetCollection: Document.collection.name,
    });
  }

  return migrated;
}
