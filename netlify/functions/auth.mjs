import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT || 3306),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,

            ssl: {
                rejectUnauthorized: false
            },

            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0
        });
    }

    return pool;
}

function response(statusCode, data) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS"
        },
        body: JSON.stringify(data)
    };
}

export async function handler(event) {

    if (event.httpMethod === "OPTIONS") {
        return response(200, {
            success: true
        });
    }

    if (event.httpMethod !== "POST") {
        return response(405, {
            success: false,
            message: "Only POST requests are allowed."
        });
    }

    try {

        const params = new URLSearchParams(event.body || "");

        const action = params.get("action");

        const db = getPool();

        // ==========================================
        // REGISTER
        // ==========================================

        if (action === "REGISTER") {

            const fullName = (params.get("fullName") || "").trim();
            const studentId = (params.get("studentId") || "").trim();
            const phone = (params.get("phone") || "").trim();
            const email = (params.get("email") || "").trim().toLowerCase();
            const department = (params.get("department") || "").trim();
            const course = (params.get("course") || "").trim();
            const semester = (params.get("semester") || "").trim();
            const password = params.get("password") || "";

            if (!fullName || !studentId || !email || !password) {

                return response(400, {
                    success: false,
                    message: "Please fill in all required fields."
                });
            }

            // Check if email already exists

            const [existingUsers] = await db.execute(
                "SELECT id FROM users WHERE email = ? LIMIT 1",
                [email]
            );

            if (existingUsers.length > 0) {

                return response(409, {
                    success: false,
                    message: "An account with this email already exists."
                });
            }

            // Hash password

            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert student

            await db.execute(
                `INSERT INTO users
                (
                    full_name,
                    student_id,
                    email,
                    phone,
                    department,
                    course,
                    semester,
                    password,
                    role
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'STUDENT')`,
                [
                    fullName,
                    studentId,
                    email,
                    phone,
                    department,
                    course,
                    semester,
                    hashedPassword
                ]
            );

            return response(200, {
                success: true,
                message: "Registration successful."
            });
        }

        // ==========================================
        // LOGIN
        // ==========================================

        if (action === "LOGIN") {

            const email = (params.get("email") || "").trim().toLowerCase();
            const password = params.get("password") || "";

            if (!email || !password) {

                return response(400, {
                    success: false,
                    message: "Email and password are required."
                });
            }

            const [users] = await db.execute(
                `SELECT
                    id,
                    full_name,
                    email,
                    role,
                    password
                 FROM users
                 WHERE email = ?
                 LIMIT 1`,
                [email]
            );

            if (users.length === 0) {

                return response(401, {
                    success: false,
                    message: "Invalid email or password."
                });
            }

            const user = users[0];

            const passwordMatches = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatches) {

                return response(401, {
                    success: false,
                    message: "Invalid email or password."
                });
            }

            return response(200, {
                success: true,
                message: "Login successful.",
                userId: user.id,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            });
        }

        return response(400, {
            success: false,
            message: "Invalid action."
        });

    } catch (error) {

        console.error("AUTH FUNCTION ERROR:", error);

        return response(500, {
            success: false,
            message: "Server error. Please try again later."
        });
    }
}
