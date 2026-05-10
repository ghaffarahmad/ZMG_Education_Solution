import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import {
  FEMALE_FALLBACK_NAMES,
  MALE_FALLBACK_NAMES,
  normalizeMaskedStudentNames,
} from "@/lib/maskedStudentNames";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type PreviewGender = "male" | "female";
type StudentNamePreview = {
  studentName?: string;
};

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

async function getPreviewNamesByGender(gender: PreviewGender, fallbackNames: string[]) {
  const students = await Student.aggregate<StudentNamePreview>([
    {
      $match: {
        gender,
        status: "active",
        studentName: { $type: "string", $ne: "" },
      },
    },
    { $sample: { size: 12 } },
    { $project: { _id: 0, studentName: 1 } },
  ]);

  return normalizeMaskedStudentNames(
    students.map((student) => student.studentName),
    fallbackNames
  );
}

export async function GET() {
  try {
    await connectToDatabase();

    const [maleNames, femaleNames] = await Promise.all([
      getPreviewNamesByGender("male", MALE_FALLBACK_NAMES),
      getPreviewNamesByGender("female", FEMALE_FALLBACK_NAMES),
    ]);

    return NextResponse.json({ maleNames, femaleNames }, { headers: RESPONSE_HEADERS });
  } catch (error) {
    console.error("Public student name preview failed:", error);
    return NextResponse.json(
      {
        maleNames: MALE_FALLBACK_NAMES,
        femaleNames: FEMALE_FALLBACK_NAMES,
      },
      { headers: RESPONSE_HEADERS }
    );
  }
}
