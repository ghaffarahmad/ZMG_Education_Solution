import { z } from "zod";
import { getSafeRemainingBalance, normalizeMoney } from "@/lib/feeMath";

export const BOARD_OPTIONS = ["Karachi Board", "Ziauddin Board", "AIOU"] as const;

export const PROGRAM_OPTIONS = [
  "9th",
  "10th",
  "First Year",
  "Second Year",
  "Combined Matric",
  "Combined Intermediate",
  "AIOU Matric",
  "AIOU Intermediate",
  "ADC",
  "BBA",
  "BS",
  "Matric Science",
  "Matric General",
  "Intermediate Pre-Medical",
  "Intermediate Pre-Engineering",
  "Intermediate Commerce",
  "Intermediate Arts",
  "Science",
  "Commerce",
  "Arts",
  "Other",
] as const;

export const GROUP_OPTIONS = [
  "Science",
  "General Science",
  "Computer Science",
  "Pre-Medical",
  "Pre-Engineering",
  "Commerce",
  "Humanities",
  "General",
  "Arts",
  "Other",
] as const;

export const GENDER_OPTIONS = ["male", "female"] as const;
export const STUDENT_STATUS_OPTIONS = ["active", "inactive"] as const;
export const FEE_STATUS_OPTIONS = ["clear", "pending", "partial", "overdue", "blocked"] as const;

export function normalizeCnic(value: string) {
  return String(value || "").replace(/[\s-]/g, "").trim();
}

export function normalizeGender(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export function normalizeOptionKey(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function findOptionValue<const T extends readonly string[]>(
  value: unknown,
  options: T,
  aliases: Record<string, T[number]> = {}
) {
  const key = normalizeOptionKey(value);
  if (!key) return undefined;
  const alias = aliases[key];
  if (alias) return alias;
  return options.find((option) => normalizeOptionKey(option) === key);
}

function optionalOption<const T extends readonly string[]>(options: T, aliases?: Record<string, T[number]>) {
  return (value: unknown) => {
    if (value === "" || value === null || value === undefined) return undefined;
    return findOptionValue(value, options, aliases) || String(value).trim();
  };
}

export function formatFatherRelation(fatherName: string, gender?: string) {
  if (gender === "male") return `S/O ${fatherName}`;
  if (gender === "female") return `D/O ${fatherName}`;
  return `Father Name: ${fatherName}`;
}

export function isValidCnic(value: string) {
  const normalized = normalizeCnic(value);
  return /^[0-9]{8,15}$/.test(normalized);
}

export function parseDateValue(value: unknown): Date | undefined {
  if (!value) return undefined;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const excelEpoch = Date.UTC(1899, 11, 30);
    const date = new Date(excelEpoch + value * 24 * 60 * 60 * 1000);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }

  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatDateOnly(value: unknown) {
  const date = parseDateValue(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

export function calculateStudentFees(input: {
  totalProgramFee?: number;
  discountAmount?: number;
  totalPaid?: number;
  nextDueDate?: Date | string | null;
  isManuallyBlocked?: boolean;
}) {
  const totalProgramFee = normalizeMoney(input.totalProgramFee);
  const discountAmount = normalizeMoney(input.discountAmount);
  const totalPaid = normalizeMoney(input.totalPaid);
  const finalPayableFee = Math.max(0, totalProgramFee - discountAmount);
  const remainingBalance = getSafeRemainingBalance({ finalPayableFee, totalPaid });
  const nextDueDate = parseDateValue(input.nextDueDate || undefined);

  let feeStatus: (typeof FEE_STATUS_OPTIONS)[number] = "pending";
  if (input.isManuallyBlocked) {
    feeStatus = "blocked";
  } else if (remainingBalance <= 0) {
    feeStatus = "clear";
  } else if (nextDueDate && nextDueDate < new Date()) {
    feeStatus = "overdue";
  } else if (totalPaid > 0) {
    feeStatus = "partial";
  }

  return {
    finalPayableFee,
    remainingBalance,
    feeStatus,
  };
}

export function getTotalPaidLimitMessage(input: {
  totalProgramFee?: unknown;
  discountAmount?: unknown;
  totalPaid?: unknown;
}) {
  const finalPayableFee = Math.max(0, normalizeMoney(input.totalProgramFee) - normalizeMoney(input.discountAmount));
  const totalPaid = normalizeMoney(input.totalPaid);

  if (totalPaid > finalPayableFee) {
    return `Total paid cannot exceed final payable fee of Rs ${finalPayableFee.toLocaleString("en-PK")}.`;
  }

  return null;
}

const emptyToUndefined = (value: unknown) => {
  if (value === "" || value === null || value === undefined) return undefined;
  return value;
};

const optionalNumber = z.preprocess(emptyToUndefined, z.coerce.number().min(0).optional());
const optionalDate = z.preprocess((value) => {
  if (value === "" || value === null || value === undefined) return undefined;
  const date = parseDateValue(value);
  return date ? date.toISOString() : value;
}, z.string().datetime().optional());
const genderSchema = z.preprocess(
  normalizeGender,
  z
    .string()
    .min(1, "Gender is required")
    .refine((value) => GENDER_OPTIONS.includes(value as (typeof GENDER_OPTIONS)[number]), "Gender must be Male or Female")
);

export const studentWriteSchema = z
  .object({
    studentName: z.string().trim().min(1, "Student Name is required"),
    fatherName: z.string().trim().min(1, "Father Name is required"),
    gender: genderSchema,
    cnicOrBform: z.string().trim().min(1, "CNIC/B-Form is required").refine(isValidCnic, "CNIC/B-Form must contain 8 to 15 digits"),
    dob: z.string().trim().min(1, "Date of Birth is required").refine((value) => Boolean(parseDateValue(value)), "Date of Birth must be a valid date"),
    phone: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || /^[0-9+\-\s()]{7,20}$/.test(value), "Phone format is invalid"),
    board: z.preprocess(optionalOption(BOARD_OPTIONS), z.string().trim().optional()),
    program: z.preprocess(optionalOption(PROGRAM_OPTIONS), z.string().trim().optional()),
    group: z.preprocess(optionalOption(GROUP_OPTIONS), z.string().trim().optional()),
    session: z.string().trim().optional().or(z.literal("")),
    admissionDate: optionalDate,
    totalProgramFee: optionalNumber.default(0),
    admissionFee: optionalNumber.default(0),
    monthlyFee: optionalNumber.default(0),
    discountAmount: optionalNumber.default(0),
    totalPaid: optionalNumber.default(0),
    nextDueDate: optionalDate,
    status: z.preprocess(
      (value) => findOptionValue(value || "active", STUDENT_STATUS_OPTIONS) || value,
      z.enum(STUDENT_STATUS_OPTIONS).default("active")
    ),
    notes: z.string().trim().optional().or(z.literal("")),
    paymentStatusNote: z.string().trim().optional().or(z.literal("")),
    isManuallyBlocked: z.boolean().optional().default(false),
    manualBlockReason: z.string().trim().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if ((data.discountAmount || 0) > (data.totalProgramFee || 0)) {
      ctx.addIssue({
        code: "custom",
        path: ["discountAmount"],
        message: "Discount cannot be greater than Total Program Fee",
      });
    }
  });

export type StudentWriteInput = z.infer<typeof studentWriteSchema>;

export function prepareStudentPayload(input: StudentWriteInput) {
  const normalizedCnic = normalizeCnic(input.cnicOrBform);
  const fees = calculateStudentFees({
    totalProgramFee: input.totalProgramFee,
    discountAmount: input.discountAmount,
    totalPaid: input.totalPaid,
    nextDueDate: input.nextDueDate,
    isManuallyBlocked: input.isManuallyBlocked,
  });

  return {
    ...input,
    cnicOrBform: normalizedCnic,
    gender: normalizeGender(input.gender) as (typeof GENDER_OPTIONS)[number],
    dob: formatDateOnly(input.dob),
    admissionDate: input.admissionDate ? new Date(input.admissionDate) : undefined,
    nextDueDate: input.nextDueDate ? new Date(input.nextDueDate) : undefined,
    board: input.board || undefined,
    program: input.program || undefined,
    group: input.group || undefined,
    session: input.session || undefined,
    phone: input.phone || undefined,
    notes: input.notes || undefined,
    paymentStatusNote: input.paymentStatusNote || undefined,
    manualBlockReason: input.manualBlockReason || undefined,
    ...fees,
  };
}

export function zodMessages(error: z.ZodError) {
  return error.issues.map((issue) => issue.message);
}
