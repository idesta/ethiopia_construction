import { NextResponse } from "next/server";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { r2Client } from "@/lib/r2/client";

export async function GET() {
  try {
    const result = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
        MaxKeys: 5,
      }),
    );
    return NextResponse.json({
      success: true,
      bucket: process.env.R2_BUCKET_NAME,
      objectCount: result.KeyCount,
      objects: result.Contents?.map((o) => o.Key) ?? [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 },
    );
  }
}
