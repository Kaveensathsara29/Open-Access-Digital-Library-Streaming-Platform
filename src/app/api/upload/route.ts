import { after, NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/jwt";
import { connectToDatabase } from "@/lib/mongodb";
import { isSupportedStorageContentType, uploadFile } from "@/lib/storage";
import { ActivityLog } from "@/models/ActivityLog";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required to upload assets." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name;
    const contentType = file.type;
    if (!isSupportedStorageContentType(contentType)) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
    }

    const { url, storageType } = await uploadFile(buffer, filename);
    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

    after(async () => {
      try {
        await connectToDatabase();
        await ActivityLog.create({
          action: "upload_file",
          adminEmail: session.email,
          details: `Uploaded ${filename}.`,
          ipAddress,
        });
      } catch (error) {
        console.error("Upload activity log error:", error);
      }
    });

    return NextResponse.json({
      success: true,
      url,
      storageType,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to save uploaded file locally." }, { status: 500 });
  }
}
