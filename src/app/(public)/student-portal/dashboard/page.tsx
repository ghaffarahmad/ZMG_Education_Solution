import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { StudentPortalDashboard, type PortalResult, type PublicSettings } from "@/components/student-portal/StudentPortalDashboard";
import { Container } from "@/components/ui/Container";
import { verifyToken } from "@/lib/auth";
import { getSafeRemainingBalance } from "@/lib/feeMath";
import connectToDatabase from "@/lib/mongodb";
import type { PortalDocument, PortalStudent } from "@/lib/studentPortalDisplay";
import Document from "@/models/Document";
import Setting from "@/models/Setting";
import Student from "@/models/Student";

type IdValue = {
  toString(): string;
};

type StudentRecord = Omit<PortalStudent, "_id"> & {
  _id: IdValue;
  status?: string;
};

type DocumentRecord = Omit<PortalDocument, "_id" | "createdAt"> & {
  _id: IdValue;
  createdAt?: Date | string;
};

type SettingsRecord = {
  whatsappNumber?: unknown;
  paymentBankName?: unknown;
  paymentAccountTitle?: unknown;
  paymentAccountNumber?: unknown;
  paymentInstructionText?: unknown;
};

function serializeOptionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function serializeSettings(settings: SettingsRecord | null): PublicSettings | null {
  if (!settings) return null;

  return {
    whatsappNumber: serializeOptionalString(settings.whatsappNumber),
    paymentBankName: serializeOptionalString(settings.paymentBankName),
    paymentAccountTitle: serializeOptionalString(settings.paymentAccountTitle),
    paymentAccountNumber: serializeOptionalString(settings.paymentAccountNumber),
    paymentInstructionText: serializeOptionalString(settings.paymentInstructionText),
  };
}

function serializeStudent(student: StudentRecord): PortalStudent {
  return {
    _id: student._id.toString(),
    studentName: student.studentName,
    fatherName: student.fatherName,
    gender: student.gender,
    program: student.program,
    group: student.group,
    board: student.board,
    session: student.session,
    feeStatus: student.feeStatus,
    totalProgramFee: student.totalProgramFee,
    discountAmount: student.discountAmount,
    finalPayableFee: student.finalPayableFee,
    totalPaid: student.totalPaid,
    remainingBalance: getSafeRemainingBalance({
      finalPayableFee: student.finalPayableFee,
      totalProgramFee: student.totalProgramFee,
      discountAmount: student.discountAmount,
      totalPaid: student.totalPaid,
      remainingBalance: student.remainingBalance,
    }),
    isManuallyBlocked: student.isManuallyBlocked,
  };
}

function serializeDocument(document: DocumentRecord): PortalDocument {
  const createdAt =
    document.createdAt instanceof Date
      ? document.createdAt.toISOString()
      : document.createdAt
        ? String(document.createdAt)
        : undefined;

  return {
    _id: document._id.toString(),
    title: document.title,
    type: document.type,
    createdAt,
    downloadAllowed: document.downloadAllowed,
    requiresFeeClearance: document.requiresFeeClearance,
    isPublished: document.isPublished,
    fileSize: document.fileSize,
    mimeType: document.mimeType,
  };
}

export default async function StudentPortalDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("student_session")?.value;
  const session = token ? await verifyToken(token) : null;
  const studentId = typeof session?.studentId === "string" ? session.studentId : null;

  if (!studentId) {
    redirect("/student-portal");
  }

  await connectToDatabase();

  const student = await Student.findById(studentId)
    .select(
      "studentName fatherName gender program board group session feeStatus totalProgramFee discountAmount finalPayableFee totalPaid remainingBalance isManuallyBlocked status"
    )
    .lean<StudentRecord>();

  if (!student || student.status !== "active") {
    redirect("/student-portal");
  }

  const { default: StudentEnrollment } = await import("@/models/StudentEnrollment");
  const activeEnrollment = await StudentEnrollment.findOne({
    studentId: student._id,
    academicStatus: "active"
  }).lean<any>();

  if (activeEnrollment) {
    student.program = activeEnrollment.program;
    student.board = activeEnrollment.board;
    student.session = activeEnrollment.session;
    student.group = activeEnrollment.group;
  }

  const [documents, settings] = await Promise.all([
    Document.find({
      studentId: student._id,
      isPublished: true,
    })
      .select("title type createdAt downloadAllowed requiresFeeClearance isPublished fileSize mimeType")
      .sort({ createdAt: -1 })
      .lean<DocumentRecord[]>(),
    Setting.findOne()
      .sort({ updatedAt: -1, _id: -1 })
      .select("-_id whatsappNumber paymentBankName paymentAccountTitle paymentAccountNumber paymentInstructionText")
      .lean<SettingsRecord | null>(),
  ]);

  const result: PortalResult = {
    student: serializeStudent(student),
    documents: documents.map(serializeDocument),
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--background)] py-6 sm:py-10 md:py-16">
      <Container>
        <StudentPortalDashboard result={result} settings={serializeSettings(settings)} />
      </Container>
    </div>
  );
}
