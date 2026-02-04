ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
CREATE INDEX "status_cratedAt_idx" ON "tasks" USING btree ("status","created_at" DESC NULLS LAST);