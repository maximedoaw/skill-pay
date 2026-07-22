import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 3 },
    pdf: { maxFileSize: "8MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      // Auth handled client-side via Clerk — in production you'd validate the session here
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Document upload complete:", file.url);
      return { url: file.url, uploadedAt: metadata.uploadedAt };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
