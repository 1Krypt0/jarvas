import {
  pgTable,
  json,
  text,
  timestamp,
  boolean,
  varchar,
  vector,
  index,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", [
  "free",
  "starter",
  "pro",
  "enterprise",
]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  plan: planEnum().default("free").notNull(),
  pagesUsed: integer("pages_used").notNull().default(0),
  messagesUsed: integer("messages_used").notNull().default(0),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const chat = pgTable("chat", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export type Chat = typeof chat.$inferSelect;

export const message = pgTable("message", {
  id: text("id").primaryKey(),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  role: varchar("role").notNull(),
  chatId: text("chat_id").references(() => chat.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export type Message = typeof message.$inferSelect;

export const file = pgTable("file", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  pages: integer("pages").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
});

export type Document = typeof file.$inferSelect;

export const chunk = pgTable(
  "chunk",
  {
    id: text("id").primaryKey(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }),
    metadata: json("metadata").notNull(),
    documentId: text("document_id").references(() => file.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => [
    index("embedding_index").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ],
);

export type Chunk = typeof chunk.$inferSelect;
