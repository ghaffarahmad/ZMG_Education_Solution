import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME;

function validateAdminPassword(password: string | undefined): asserts password is string {
  const suspiciousPhrases = [
    "Current issue",
    "Current issues",
    "Requirements",
    "Do not change backend logic",
    "Fix mobile responsiveness",
    "Student Portal dashboard",
  ];

  if (!password) {
    throw new Error("ADMIN_PASSWORD is required.");
  }

  if (password.length < 8 || password.length > 128) {
    throw new Error("ADMIN_PASSWORD must be between 8 and 128 characters.");
  }

  if (suspiciousPhrases.some((phrase) => password.includes(phrase))) {
    throw new Error("ADMIN_PASSWORD appears to contain prompt or instruction text.");
  }
}

async function seedAdmin() {
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_NAME) {
    console.error("Missing required environment variables.");
    process.exit(1);
  }

  try {
    validateAdminPassword(ADMIN_PASSWORD);
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB.");

    const AdminUserSchema = new mongoose.Schema(
      {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
      },
      { timestamps: true }
    );
    
    const AdminUser = mongoose.models.AdminUser || mongoose.model("AdminUser", AdminUserSchema);

    const existingAdmin = await AdminUser.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    await AdminUser.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
    });

    console.log("Admin user created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
