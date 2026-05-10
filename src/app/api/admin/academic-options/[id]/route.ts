import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import AcademicOption from "@/models/AcademicOption";
import StudentEnrollment from "@/models/StudentEnrollment";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // We only allow updating certain fields to avoid complex relationship breakages
    const updateData: any = {};
    if (body.name !== undefined) {
      updateData.name = body.name;
      // Note: we don't auto-update slug to prevent breaking existing text references if we ever use them
    }
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.sortOrder !== undefined) updateData.sortOrder = body.sortOrder;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { id } = await context.params;
    const updatedOption = await AcademicOption.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!updatedOption) {
      return NextResponse.json({ success: false, message: "Option not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedOption });
  } catch (error) {
    console.error("PATCH /api/admin/academic-options/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    const { id } = await context.params;
    const option = await AcademicOption.findById(id);
    if (!option) {
      return NextResponse.json({ success: false, message: "Option not found" }, { status: 404 });
    }

    // Check if it's used in any enrollment by its text value
    // Since enrollments store the string value, we query by that string.
    const usedInEnrollment = await StudentEnrollment.exists({
      $or: [
        { board: option.name },
        { program: option.name },
        { group: option.name }
      ]
    });

    if (usedInEnrollment) {
      // Soft delete by deactivating
      option.isActive = false;
      await option.save();
      return NextResponse.json({ success: true, message: "Option is in use. It has been deactivated instead of deleted.", data: option });
    }

    // Check if it's referenced by other options (e.g. a board used by a program)
    const referencedByOtherOptions = await AcademicOption.exists({
      $or: [
        { boardId: option._id },
        { programId: option._id }
      ]
    });

    if (referencedByOtherOptions) {
      option.isActive = false;
      await option.save();
      return NextResponse.json({ success: true, message: "Option is referenced by other settings. It has been deactivated instead of deleted.", data: option });
    }

    // Hard delete
    await AcademicOption.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Option deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/academic-options/[id] error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
