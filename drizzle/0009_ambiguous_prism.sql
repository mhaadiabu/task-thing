DROP INDEX "status_cratedAt_idx";--> statement-breakpoint
CREATE INDEX "status_updatedAt_idx" ON "tasks" USING btree ("status","updated_at" DESC NULLS LAST);