-- Demo accounts from the original queueless_db.sql, with bcrypt-hashed passwords
INSERT INTO "users" ("full_name", "email", "password", "role")
VALUES ('QueueLess Admin', 'admin@queueless.com', '$2b$10$0qe2HNDwA5uh3qE/jHGD9O6nmf5xWyOtoUPG/ipKF5jtGiE2zjMUq', 'ADMIN')
ON CONFLICT ("email") DO NOTHING;
--> statement-breakpoint
INSERT INTO "users" ("full_name", "student_id", "email", "phone", "department", "course", "semester", "password", "role")
VALUES ('Demo Student', 'QL001', 'student@queueless.com', '9999999999', 'Computer Science', 'BSc CS', 'Semester 5', '$2b$10$uqX.Q9FoFElc4BQV0kBvq.DpC01FnnrWYfNEH8RRTH82rXjNiZsCO', 'STUDENT')
ON CONFLICT ("email") DO NOTHING;
--> statement-breakpoint
INSERT INTO "counters" ("counter_name", "status") VALUES
  ('Counter 1', 'ACTIVE'),
  ('Counter 2', 'ACTIVE'),
  ('Counter 3', 'INACTIVE');
