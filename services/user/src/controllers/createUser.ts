import { Request, Response, NextFunction } from "express";
import { UserCreateSchema } from "../schemas";
import prisma from "@/prisma";

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedBody = UserCreateSchema.safeParse(req.body);

		if (!parsedBody.success) {
			return res.status(400).json({ error: parsedBody.error.message });
		}

		const existingUser = await prisma.user.findFirst({
			where: {
				authUserId: parsedBody.data.authUserId,
			},
		});

		if (existingUser) {
			return res.status(400).json({ error: "User already exists" });
		}

		const user = await prisma.user.create({
			data: parsedBody.data,
		});

		return res.status(201).json(user);
	} catch (error) {
		next(error);
	}
};
