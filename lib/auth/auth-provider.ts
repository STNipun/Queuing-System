import { IAuthProvider } from "./auth-provider.interface";
import { AuthResponse } from "./auth-types";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

class CustomAuthProvider implements IAuthProvider
{
    // -------- private helpers --------

    private getJwtSecret(): string
    {
        if (!JWT_SECRET)
        {
            throw new Error("JWT_SECRET is missing from environment variables");
        }
        return JWT_SECRET;
    }

    private signToken(payload: Record<string, unknown>): string
    {
        return jwt.sign(payload, this.getJwtSecret(), { expiresIn: "7d" });
    }

    private verifyJwt(token: string): jwt.JwtPayload
    {
        const decoded = jwt.verify(token, this.getJwtSecret());
        if (typeof decoded === "string")
        {
            throw new Error("Invalid token payload");
        }
        return decoded;
    }

    private mapError(error: unknown): string
    {
        if (error instanceof Error)
        {
            return this.mapErrorMessage(error.message);
        }
        return "An unexpected error occurred";
    }

    private mapErrorMessage(message: string): string
    {
        if (message.includes("Invalid username or password"))
        {
            return "Invalid username or password";
        }
        if (message.includes("Username already exists"))
        {
            return "This username is already taken";
        }
        if (message.includes("jwt expired"))
        {
            return "Your session has expired. Please log in again";
        }
        if (message.includes("invalid signature") || message.includes("JsonWebTokenError"))
        {
            return "Invalid session. Please log in again";
        }
        if (message.includes("JWT_SECRET is missing"))
        {
            return "Server configuration error";
        }
        return "An error occurred during authentication";
    }

    // -------- public methods --------

    async signIn(username: string, password: string): Promise<AuthResponse>
    {
        try
        {
            const user = await prisma.user.findUnique({ where: { username } });

            if (!user)
            {
                return { success: false, error: "Invalid username or password" };
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch)
            {
                return { success: false, error: "Invalid username or password" };
            }

            const token = this.signToken({ id: user.id, username: user.username, role: user.role });

            return {
                success: true,
                user: {
                    uid: String(user.id),
                    username: user.username,
                    displayName: `${user.first_name} ${user.last_name}`,
                    role: user.role,
                },
                token,
            };
        } catch (error)
        {
            console.error("[AUTH_SIGN_IN_ERROR]", error);
            return { success: false, error: this.mapError(error) };
        }
    }

    async signUp(
        username: string,
        password: string,
        first_name: string,
        last_name: string,
        role?: string
    ): Promise<AuthResponse>
    {
        try
        {
            const existingUser = await prisma.user.findUnique({ where: { username } });
            if (existingUser)
            {
                return { success: false, error: "This username is already taken" };
            }

            if (password.length < 8)
            {
                return { success: false, error: "Password must be at least 8 characters" };
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const user = await prisma.user.create({
                data: {
                    first_name,
                    last_name,
                    username,
                    password: hashedPassword,
                    role: role ?? "user",
                },
            });

            const token = this.signToken({ id: user.id, username: user.username, role: user.role });

            return {
                success: true,
                user: {
                    uid: String(user.id),
                    username: user.username,
                    displayName: `${user.first_name} ${user.last_name}`,
                    role: user.role,
                },
                token,
            };
        } catch (error)
        {
            console.error("[AUTH_SIGN_UP_ERROR]", error);
            return { success: false, error: this.mapError(error) };
        }
    }

    async verifyToken(token: string): Promise<AuthResponse>
    {
        try
        {
            const decoded = this.verifyJwt(token);

            const user = await prisma.user.findUnique({
                where: { id: Number(decoded.id) },
            });

            if (!user)
            {
                return { success: false, error: "User not found" };
            }

            return {
                success: true,
                user: {
                    uid: String(user.id),
                    username: user.username,
                    displayName: `${user.first_name} ${user.last_name}`,
                    role: user.role,
                },
            };
        } catch (error)
        {
            console.error("[AUTH_VERIFY_TOKEN_ERROR]", error);
            return { success: false, error: this.mapError(error) };
        }
    }

    async signOut(): Promise<void>
    {
        // Token invalidation is handled at the HTTP layer by clearing the auth-token cookie.
        // No server-side action is needed here.
        return;
    }
}

export const authProvider = new CustomAuthProvider();
