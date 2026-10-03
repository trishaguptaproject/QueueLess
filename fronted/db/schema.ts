import { pgTable, serial, text, timestamp, date } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial().primaryKey(),
  fullName: text("full_name").notNull(),
  studentId: text("student_id"),
  email: text().notNull().unique(),
  phone: text(),
  department: text(),
  course: text(),
  semester: text(),
  password: text().notNull(),
  role: text().notNull().default("STUDENT"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Queue statuses: WAITING -> CALLED -> SERVING -> COMPLETED
export const queue = pgTable("queue", {
  id: serial().primaryKey(),
  studentName: text("student_name").notNull(),
  serviceName: text("service_name").notNull(),
  tokenNumber: text("token_number").notNull().unique(),
  status: text().notNull().default("WAITING"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const counters = pgTable("counters", {
  id: serial().primaryKey(),
  counterName: text("counter_name").notNull(),
  status: text().notNull().default("ACTIVE"),
  currentToken: text("current_token"),
});

export const appointments = pgTable("appointments", {
  id: serial().primaryKey(),
  studentName: text("student_name").notNull(),
  serviceName: text("service_name").notNull(),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  reason: text(),
  status: text().notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const helpDeskRequests = pgTable("help_desk_requests", {
  id: serial().primaryKey(),
  studentName: text("student_name").notNull(),
  subject: text().notNull(),
  description: text().notNull(),
  status: text().notNull().default("OPEN"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentRequests = pgTable("document_requests", {
  id: serial().primaryKey(),
  studentName: text("student_name").notNull(),
  documentType: text("document_type").notNull(),
  purpose: text(),
  status: text().notNull().default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type QueueEntry = typeof queue.$inferSelect;
