/**
 * Changes the admin account's e-mail and/or password IN PLACE (same account, so
 * documents it uploaded stay linked to it). Touches nothing else.
 *
 * PowerShell:
 *   $env:NEW_ADMIN_EMAIL = "you@example.com"        # optional
 *   $env:NEW_ADMIN_PASSWORD = "a-strong-password"   # optional, min 8 characters
 *   $env:NEW_ADMIN_NAME = "Your Name"               # optional
 *   npm run admin:set
 *
 * Set at least one. If there is more than one admin, also set CURRENT_ADMIN_EMAIL.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db/connect";
import { User } from "../src/lib/db/models/User";

async function main() {
  const newEmail = process.env.NEW_ADMIN_EMAIL?.trim().toLowerCase();
  const newPassword = process.env.NEW_ADMIN_PASSWORD;
  const newName = process.env.NEW_ADMIN_NAME?.trim();
  const currentEmail = process.env.CURRENT_ADMIN_EMAIL?.trim().toLowerCase();

  if (!newEmail && !newPassword && !newName) {
    throw new Error("Nothing to change. Set NEW_ADMIN_EMAIL, NEW_ADMIN_PASSWORD and/or NEW_ADMIN_NAME.");
  }
  if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) throw new Error("NEW_ADMIN_EMAIL is not a valid e-mail address.");
  if (newPassword && newPassword.length < 8) throw new Error("NEW_ADMIN_PASSWORD must be at least 8 characters.");

  await connectDB();
  const admins = await User.find(currentEmail ? { email: currentEmail, role: "admin" } : { role: "admin" });
  if (admins.length === 0) throw new Error("No matching admin user found.");
  if (admins.length > 1) throw new Error("More than one admin found. Set CURRENT_ADMIN_EMAIL to choose which one to change.");
  const admin = admins[0];

  if (newEmail && newEmail !== admin.email) {
    if (await User.exists({ email: newEmail })) throw new Error("That e-mail is already used by another account.");
    admin.email = newEmail;
  }
  if (newName) admin.name = newName;
  if (newPassword) admin.passwordHash = await bcrypt.hash(newPassword, 12);
  await admin.save();

  console.log("Admin updated.");
  console.log(`  e-mail:   ${admin.email}`);
  console.log(`  password: ${newPassword ? "changed" : "unchanged"}`);
  console.log("Sign out and sign in again with the new details.");
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  await mongoose.disconnect();
  process.exit(1);
});
