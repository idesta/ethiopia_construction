import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "@/lib/r2/client";

export async function POST(request: NextRequest) {
  try {
    const { fileName, fileType, folder } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: "fileName and fileType are required" },
        { status: 400 },
      );
    }

    // Build a unique key so files never overwrite each other
    // e.g.  projects/company-one/1714000000000-photo.jpg
    const timestamp = Date.now();
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const key = `${folder || "uploads"}/${timestamp}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    // URL expires in 5 minutes — plenty of time to upload
    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 300,
    });

    // The final public URL of the file after upload
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ presignedUrl, publicUrl, key });
  } catch (error) {
    console.error("R2 presign error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 },
    );
  }
}
