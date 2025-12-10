-- Add user_id column as nullable first
ALTER TABLE "tasks" ADD COLUMN "user_id" text;
--> statement-breakpoint
-- Update existing tasks to have a default user_id (first user in the system, or you can change this)
UPDATE "tasks" SET "user_id" = (SELECT "id" FROM "user" LIMIT 1) WHERE "user_id" IS NULL;
--> statement-breakpoint
-- Make user_id NOT NULL now that all rows have a value
ALTER TABLE "tasks" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
-- Add foreign key constraint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
-- Drop image column from user table if it exists
ALTER TABLE "user" DROP COLUMN IF EXISTS "image";
