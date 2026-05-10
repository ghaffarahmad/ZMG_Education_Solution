import connectToDatabase from "@/lib/mongodb";
import { createStudentTemplateWorkbook, workbookResponse } from "@/lib/studentExcel";

export async function GET() {
  await connectToDatabase();
  return workbookResponse(await createStudentTemplateWorkbook(), "student_import_template.xlsx");
}
