import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const statusEnum = pgEnum('status', ['pending', 'completed']);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    task: text('task').notNull(),
    status: statusEnum('status').default('pending').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('status_cratedAt_idx').on(table.status, table.createdAt.desc()),
  ],
);
