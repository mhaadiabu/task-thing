import { pgTable, text, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

const statusEnum = pgEnum('status', ['pending', 'completed']);

export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  task: text('task').notNull(),
  status: statusEnum('status').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
