import { Request, Response, NextFunction } from "express";
import { InventoryCreateDTOSchema } from "../schemas";
import prisma from "@/prisma";

const createInventory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);

		if (!parsedBody.success) {
			return res.status(400).json({
				message: "Invalid request body",
				errors: parsedBody.error.errors,
			});
		}

		const inventory = await prisma.inventory.create({
			data: {
				...parsedBody.data,
				quantity: parsedBody.data.quantity ?? 0,
				histories: {
					create: {
						actionType: "IN",
						quantityChanged: parsedBody.data.quantity ?? 0,
						lastQuantity: 0,
						newQuantity: parsedBody.data.quantity ?? 0,
					},
				},
			},
			select: {
				id: true,
				quantity: true,
			},
		});

		res.status(201).json({
			message: "Inventory created successfully",
			inventory,
		});
	} catch (error) {
		next(error);
	}
};

export default createInventory;
