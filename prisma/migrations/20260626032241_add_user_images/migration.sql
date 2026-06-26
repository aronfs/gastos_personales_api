-- CreateTable
CREATE TABLE "user_images" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(50) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_images_user_id_key" ON "user_images"("user_id");

-- CreateIndex
CREATE INDEX "user_images_user_id_idx" ON "user_images"("user_id");

-- AddForeignKey
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
