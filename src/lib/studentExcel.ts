import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import Student from "@/models/Student";
import {
  BOARD_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  findOptionValue,
  formatDateOnly,
  getTotalPaidLimitMessage,
  normalizeCnic,
  normalizeGender,
  prepareStudentPayload,
  studentWriteSchema,
} from "@/lib/studentRules";
import { getSafeRemainingBalance } from "@/lib/feeMath";

export const STUDENT_IMPORT_HEADERS = [
  "Student Name",
  "Father Name",
  "Gender",
  "CNIC/B-Form",
  "Date of Birth",
  "Phone",
  "Board",
  "Program",
  "Group",
  "Session",
  "Admission Date",
  "Student Status",
  "Total Program Fee",
  "Discount",
  "Total Paid",
  "Next Due Date",
  "Notes",
] as const;

const CALCULATED_EXPORT_HEADERS = ["Final Payable Fee", "Remaining Balance", "Fee Status"] as const;
export const STUDENT_EXPORT_HEADERS = [...STUDENT_IMPORT_HEADERS, ...CALCULATED_EXPORT_HEADERS] as const;

import AcademicOption from "@/models/AcademicOption";

const TEMPLATE_GENDER_OPTIONS = ["Male", "Female"] as const;

export async function getDynamicTemplateOptions() {
  const options = await AcademicOption.find({ isActive: true }).lean<any[]>();
  return {
    Gender: TEMPLATE_GENDER_OPTIONS,
    Board: options.filter(o => o.type === "board").map(o => o.name),
    Program: options.filter(o => o.type === "program").map(o => o.name),
    Group: options.filter(o => o.type === "group").map(o => o.name),
    "Student Status": STUDENT_STATUS_OPTIONS,
  };
}

type DynamicTemplateOptions = Awaited<ReturnType<typeof getDynamicTemplateOptions>>;
type TemplateOptionName = keyof DynamicTemplateOptions;

export type StudentImportRow = {
  rowNumber: number;
  status: "create" | "update";
  data: Record<string, unknown>;
  errors: string[];
};

const HEADER_ALIASES: Record<string, string> = {
  "student name": "studentName",
  "father name": "fatherName",
  gender: "gender",
  "cnic/b form": "cnicOrBform",
  "cnic/b-form": "cnicOrBform",
  cnic: "cnicOrBform",
  "b form": "cnicOrBform",
  "b-form": "cnicOrBform",
  "date of birth": "dob",
  dob: "dob",
  phone: "phone",
  board: "board",
  program: "program",
  group: "group",
  session: "session",
  "admission date": "admissionDate",
  "student status": "status",
  status: "status",
  "total program fee": "totalProgramFee",
  "total fee": "totalProgramFee",
  discount: "discountAmount",
  "discount amount": "discountAmount",
  "total paid": "totalPaid",
  paid: "totalPaid",
  "next due date": "nextDueDate",
  notes: "notes",
};

const FIELD_LABELS: Record<string, string> = {
  gender: "Gender",
  board: "Board",
  program: "Program",
  group: "Group",
  status: "Student Status",
};

function normalizeHeader(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function numberValue(value: unknown) {
  if (value === "" || value === null || value === undefined) return 0;
  return Number(String(value).replace(/,/g, ""));
}

function titleGender(value: unknown) {
  const gender = normalizeGender(value);
  if (gender === "male") return "Male";
  if (gender === "female") return "Female";
  return "";
}

function rowError(rowNumber: number, message: string) {
  return `Row ${rowNumber}: ${message}`;
}

function allowedText(options: readonly string[]) {
  return options.join(", ");
}

function friendlyOptionError(optionName: TemplateOptionName, dynamicOptions: DynamicTemplateOptions) {
  if (optionName === "Program") {
    return "Invalid Program. Please select a value from the Program dropdown.";
  }
  if (optionName === "Board") {
    return `Invalid Board. Allowed values are ${allowedText(dynamicOptions.Board)}.`;
  }
  if (optionName === "Group") {
    return `Invalid Group. Allowed values are ${allowedText(dynamicOptions.Group)}.`;
  }
  if (optionName === "Gender") {
    return `Invalid Gender. Allowed values are ${allowedText(dynamicOptions.Gender)}.`;
  }
  return `Invalid Student Status. Allowed values are ${allowedText(dynamicOptions["Student Status"])}.`;
}

function canonicalTemplateOption(
  value: unknown,
  optionName: TemplateOptionName,
  dynamicOptions: DynamicTemplateOptions,
  rowNumber?: number,
  required = false
) {
  const raw = String(value || "").trim();
  const options = dynamicOptions[optionName] as string[];
  if (!raw) {
    if (required && rowNumber) {
      return {
        value: "",
        error: rowError(rowNumber, `${optionName} is required. Please select a value from the ${optionName} dropdown.`),
      };
    }
    return { value: "" };
  }

  const match = findOptionValue(raw, options);
  if (match) return { value: match };

  return {
    value: raw,
    error: rowNumber ? rowError(rowNumber, friendlyOptionError(optionName, dynamicOptions)) : friendlyOptionError(optionName, dynamicOptions),
  };
}

function standardizeProgram(value: unknown, dynamicOptions: DynamicTemplateOptions) {
  return findOptionValue(value, dynamicOptions.Program) || String(value || "").trim();
}

function standardizeGroup(value: unknown, dynamicOptions: DynamicTemplateOptions) {
  return findOptionValue(value, dynamicOptions.Group) || String(value || "").trim();
}

function standardizeBoard(value: unknown, dynamicOptions: DynamicTemplateOptions) {
  return findOptionValue(value, dynamicOptions.Board) || String(value || "").trim();
}

export function studentsToWorksheetRows(students: any[], dynamicOptions: DynamicTemplateOptions) {
  return students.map((student) => ({
    "Student Name": student.studentName || "",
    "Father Name": student.fatherName || "",
    Gender: titleGender(student.gender),
    "CNIC/B-Form": student.cnicOrBform || "",
    "Date of Birth": student.dob || "",
    Phone: student.phone || "",
    Board: standardizeBoard(student.board, dynamicOptions),
    Program: standardizeProgram(student.program, dynamicOptions),
    Group: standardizeGroup(student.group, dynamicOptions),
    Session: student.session || "",
    "Admission Date": formatDateOnly(student.admissionDate || student.createdAt),
    "Student Status": findOptionValue(student.status || "active", STUDENT_STATUS_OPTIONS) || "active",
    "Total Program Fee": student.totalProgramFee || 0,
    Discount: student.discountAmount || 0,
    "Total Paid": student.totalPaid || 0,
    "Next Due Date": formatDateOnly(student.nextDueDate),
    Notes: student.notes || "",
    "Final Payable Fee": student.finalPayableFee || 0,
    "Remaining Balance": getSafeRemainingBalance({
      finalPayableFee: student.finalPayableFee,
      totalProgramFee: student.totalProgramFee,
      discountAmount: student.discountAmount,
      totalPaid: student.totalPaid,
      remainingBalance: student.remainingBalance,
    }),
    "Fee Status": student.feeStatus || "",
  }));
}

function toExcelBuffer(buffer: Buffer | ArrayBuffer) {
  if (buffer instanceof ArrayBuffer) return new Uint8Array(buffer);
  return new Uint8Array(buffer as Buffer);
}

export async function workbookResponse(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(toExcelBuffer(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function columnLetter(index: number) {
  let value = "";
  let current = index;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    value = String.fromCharCode(65 + remainder) + value;
    current = Math.floor((current - remainder) / 26);
  }
  return value;
}

function styleWorksheet(worksheet: ExcelJS.Worksheet) {
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: worksheet.columnCount },
  };

  const header = worksheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D3B46" } };
  header.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  header.height = 24;

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
    });
  });
}

function applyColumnFormats(worksheet: ExcelJS.Worksheet, headers: readonly string[]) {
  const textColumns = ["CNIC/B-Form", "Phone", "Session"];
  const dateColumns = ["Date of Birth", "Admission Date", "Next Due Date"];

  headers.forEach((header, index) => {
    const column = worksheet.getColumn(index + 1);
    if (textColumns.includes(header)) column.numFmt = "@";
    if (dateColumns.includes(header)) column.numFmt = "yyyy-mm-dd";
  });
}

function buildStudentWorkbook(headers: readonly string[], rows: Record<string, unknown>[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ZMG Education Portal";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Students");
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width:
      header === "Student Name" || header === "Father Name"
        ? 24
        : header === "CNIC/B-Form"
          ? 18
          : header === "Notes"
            ? 32
            : 16,
  }));

  rows.forEach((row) => worksheet.addRow(row));
  applyColumnFormats(worksheet, headers);
  styleWorksheet(worksheet);
  return workbook;
}

export async function createStudentsWorkbook(students: any[]) {
  const dynamicOptions = await getDynamicTemplateOptions();
  return buildStudentWorkbook([...STUDENT_EXPORT_HEADERS], studentsToWorksheetRows(students, dynamicOptions));
}

function addOptionsSheet(workbook: ExcelJS.Workbook, dynamicOptions: DynamicTemplateOptions) {
  const worksheet = workbook.addWorksheet("Options");
  const optionEntries = Object.entries(dynamicOptions) as [TemplateOptionName, readonly string[]][];

  worksheet.columns = optionEntries.map(([name]) => ({ header: name, key: name, width: 26 }));
  optionEntries.forEach(([, options], columnIndex) => {
    options.forEach((option, rowIndex) => {
      worksheet.getCell(rowIndex + 2, columnIndex + 1).value = option;
    });
    worksheet.getCell(1, columnIndex + 1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getCell(1, columnIndex + 1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0D3B46" } };
  });

  worksheet.getCell("G1").value = "Date Guidance";
  worksheet.getCell("G1").font = { bold: true };
  worksheet.getCell("G2").value = "Use date format YYYY-MM-DD, example: 2006-05-24";
  worksheet.getColumn("G").width = 52;
  return worksheet;
}

function addTemplateDropdowns(workbook: ExcelJS.Workbook, worksheet: ExcelJS.Worksheet, dynamicOptions: DynamicTemplateOptions) {
  const optionColumns: Record<TemplateOptionName, number> = {
    Gender: 1,
    Board: 2,
    Program: 3,
    Group: 4,
    "Student Status": 5,
  };
  const headerToOption: Partial<Record<(typeof STUDENT_IMPORT_HEADERS)[number], TemplateOptionName>> = {
    Gender: "Gender",
    Board: "Board",
    Program: "Program",
    Group: "Group",
    "Student Status": "Student Status",
  };

  STUDENT_IMPORT_HEADERS.forEach((header, headerIndex) => {
    const optionName = headerToOption[header];
    if (!optionName) return;
    const optionColumn = optionColumns[optionName];
    const optionLength = dynamicOptions[optionName].length;
    const range = `Options!$${columnLetter(optionColumn)}$2:$${columnLetter(optionColumn)}$${optionLength + 1}`;
    for (let row = 2; row <= 501; row += 1) {
      worksheet.getCell(row, headerIndex + 1).dataValidation = {
        type: "list",
        allowBlank: optionName !== "Gender",
        formulae: [range],
        showErrorMessage: true,
        errorStyle: "error",
        errorTitle: `Invalid ${optionName}`,
        error: `Please select a value from the ${optionName} dropdown.`,
      };
    }
  });
}

export async function createStudentTemplateWorkbook() {
  const dynamicOptions = await getDynamicTemplateOptions();
  const workbook = buildStudentWorkbook(
    [...STUDENT_IMPORT_HEADERS],
    [
      {
        "Student Name": "Ali Khan",
        "Father Name": "Ahmed Khan",
        Gender: "Male",
        "CNIC/B-Form": "4210112345678",
        "Date of Birth": "2008-05-20",
        Phone: "03001234567",
        Board: "Karachi Board",
        Program: "Combined Matric",
        Group: "Science",
        Session: "2025-2026",
        "Admission Date": "2026-01-15",
        "Student Status": "active",
        "Total Program Fee": 50000,
        Discount: 5000,
        "Total Paid": 10000,
        "Next Due Date": "2026-06-30",
        Notes: "Optional internal note",
      },
    ]
  );
  const worksheet = workbook.getWorksheet("Students");
  addOptionsSheet(workbook, dynamicOptions);

  if (worksheet) {
    addTemplateDropdowns(workbook, worksheet, dynamicOptions);
    ["Date of Birth", "Admission Date", "Next Due Date"].forEach((header) => {
      const columnIndex = STUDENT_IMPORT_HEADERS.indexOf(header as (typeof STUDENT_IMPORT_HEADERS)[number]) + 1;
      worksheet.getCell(1, columnIndex).note = "Use date format YYYY-MM-DD, example: 2006-05-24. Excel date cells are also accepted during import.";
    });
    ["CNIC/B-Form", "Phone", "Session"].forEach((header) => {
      const columnIndex = STUDENT_IMPORT_HEADERS.indexOf(header as (typeof STUDENT_IMPORT_HEADERS)[number]) + 1;
      worksheet.getCell(1, columnIndex).note = "This column is formatted as text to preserve digits and formatting.";
    });
  }

  return workbook;
}

function normalizeImportOption(raw: Record<string, unknown>, rowNumber: number, dynamicOptions: DynamicTemplateOptions) {
  const invalidFields = new Set<string>();
  const errors: string[] = [];

  const gender = canonicalTemplateOption(raw.gender, "Gender", dynamicOptions, rowNumber, true);
  const board = canonicalTemplateOption(raw.board, "Board", dynamicOptions, rowNumber);
  const program = canonicalTemplateOption(raw.program, "Program", dynamicOptions, rowNumber);
  const group = canonicalTemplateOption(raw.group, "Group", dynamicOptions, rowNumber);
  const status = canonicalTemplateOption(raw.status || "active", "Student Status", dynamicOptions, rowNumber);

  [
    ["gender", gender],
    ["board", board],
    ["program", program],
    ["group", group],
    ["status", status],
  ].forEach(([field, result]) => {
    const typedResult = result as { value: string; error?: string };
    if (typedResult.error) {
      invalidFields.add(field as string);
      errors.push(typedResult.error);
    }
  });

  return {
    values: {
      gender: gender.value ? normalizeGender(gender.value) : "",
      board: board.value,
      program: program.value,
      group: group.value,
      status: status.value || "active",
    },
    invalidFields,
    errors,
  };
}

function friendlyZodIssue(rowNumber: number, issue: { path: PropertyKey[]; message: string }) {
  const field = String(issue.path[0] || "");
  if (field === "discountAmount") {
    return rowError(rowNumber, "Discount cannot be greater than Total Program Fee.");
  }
  const label = FIELD_LABELS[field];
  if (label) {
    return rowError(rowNumber, `${label}: ${issue.message}`);
  }
  return rowError(rowNumber, issue.message);
}

export async function parseStudentWorkbook(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });

  if (rows.length < 2) {
    return [];
  }

  const dynamicOptions = await getDynamicTemplateOptions();
  const header = rows[0].map((cell) => HEADER_ALIASES[normalizeHeader(cell)] || "");
  const seenCnics = new Map<string, number>();
  const parsedRows: StudentImportRow[] = [];

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.some((cell) => String(cell || "").trim())) continue;

    const rowNumber = index + 1;
    const raw: Record<string, unknown> = {};
    header.forEach((field, cellIndex) => {
      if (field) raw[field] = row[cellIndex];
    });

    const cnic = normalizeCnic(String(raw.cnicOrBform || ""));
    const errors: string[] = [];

    if (cnic) {
      const previous = seenCnics.get(cnic);
      if (previous) {
        errors.push(rowError(rowNumber, `Duplicate CNIC/B-Form in Excel. Also appears on row ${previous}.`));
      } else {
        seenCnics.set(cnic, rowNumber);
      }
    }

    const normalizedOptions = normalizeImportOption(raw, rowNumber, dynamicOptions);
    errors.push(...normalizedOptions.errors);

    const data = {
      studentName: String(raw.studentName || "").trim(),
      fatherName: String(raw.fatherName || "").trim(),
      gender: normalizedOptions.values.gender,
      cnicOrBform: cnic,
      dob: formatDateOnly(raw.dob),
      phone: String(raw.phone || "").trim(),
      board: normalizedOptions.values.board,
      program: normalizedOptions.values.program,
      group: normalizedOptions.values.group,
      session: String(raw.session || "").trim(),
      admissionDate: formatDateOnly(raw.admissionDate),
      status: normalizedOptions.values.status,
      totalProgramFee: numberValue(raw.totalProgramFee),
      discountAmount: numberValue(raw.discountAmount),
      totalPaid: numberValue(raw.totalPaid),
      nextDueDate: formatDateOnly(raw.nextDueDate),
      notes: String(raw.notes || "").trim(),
    };

    const validation = studentWriteSchema.safeParse(data);
    if (!validation.success) {
      errors.push(
        ...validation.error.issues
          .filter((issue) => !normalizedOptions.invalidFields.has(String(issue.path[0] || "")))
          .map((issue) => friendlyZodIssue(rowNumber, issue))
      );
    }

    if (validation.success) {
      const totalPaidLimitMessage = getTotalPaidLimitMessage(validation.data);
      if (totalPaidLimitMessage) {
        errors.push(rowError(rowNumber, totalPaidLimitMessage));
      }
    }

    const existing = cnic ? await Student.findOne({ cnicOrBform: cnic }).select("_id") : null;

    parsedRows.push({
      rowNumber,
      status: existing ? "update" : "create",
      data: validation.success ? prepareStudentPayload(validation.data) : data,
      errors,
    });
  }

  return parsedRows;
}
