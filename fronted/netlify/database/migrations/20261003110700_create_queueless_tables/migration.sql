CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY,
	"student_name" text NOT NULL,
	"service_name" text NOT NULL,
	"appointment_date" date NOT NULL,
	"appointment_time" text NOT NULL,
	"reason" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "counters" (
	"id" serial PRIMARY KEY,
	"counter_name" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"current_token" text
);
--> statement-breakpoint
CREATE TABLE "document_requests" (
	"id" serial PRIMARY KEY,
	"student_name" text NOT NULL,
	"document_type" text NOT NULL,
	"purpose" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "help_desk_requests" (
	"id" serial PRIMARY KEY,
	"student_name" text NOT NULL,
	"subject" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "queue" (
	"id" serial PRIMARY KEY,
	"student_name" text NOT NULL,
	"service_name" text NOT NULL,
	"token_number" text NOT NULL UNIQUE,
	"status" text DEFAULT 'WAITING' NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY,
	"full_name" text NOT NULL,
	"student_id" text,
	"email" text NOT NULL UNIQUE,
	"phone" text,
	"department" text,
	"course" text,
	"semester" text,
	"password" text NOT NULL,
	"role" text DEFAULT 'STUDENT' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
