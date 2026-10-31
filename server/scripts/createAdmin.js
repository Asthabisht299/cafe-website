
import bcrypt from "bcrypt";
import db from "../config/db.js";

async function createAdmin() {
  try {
    const name = "Cafe Admin";
    const email = "admin@cafe.com";
    const password = "Astha@29!";

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      console.log("Admin account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, 'admin')`,
      [name, email, hashedPassword]
    );

    console.log("Admin account created successfully!");
    console.log("Email:", email);
    console.log("Change the temporary password before using this account.");
  } catch (error) {
    console.error("Admin creation failed:", error.message);
  } finally {
    await db.end();
  }
}

createAdmin();
