import { NextResponse } from "next/server";
import { mkdir, readdir, stat, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { allowedTypes } from "../../../../utils/allowedFileTypes";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const userId = formData.get("userId") as string;

  if (!file || !userId) {
    return NextResponse.json(
      { error: "Missing file or userId" },
      { status: 400 },
    );
  }

  const MAX_SIZE = 20 * 1024 * 1024; // 20MB

  if (!allowedTypes.includes(file.type))
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  if (file.size > MAX_SIZE)
    return NextResponse.json({ error: "File too large" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());

  const uploadDir = path.join(process.cwd(), "public", "avatar");
  const filePath = path.join(uploadDir, userId + path.extname(file.name));

  const existingFiles = await readdir(uploadDir);
  for (const existing of existingFiles) {
    const baseName = path.parse(existing).name;
    if (baseName === userId) {
      await unlink(path.join(uploadDir, existing));
    }
  }

  try {
    await stat(uploadDir);
  } catch {
    await mkdir(uploadDir, { recursive: true });
  }

  await writeFile(filePath, bytes);
  const fullFile = userId + path.extname(file.name);

  await db
    .update(user)
    .set({
      image: fullFile,
    })
    .where(eq(user.id, userId));

  return NextResponse.json({
    success: true,
    url: `/avatar/${fullFile}`,
  });
}
