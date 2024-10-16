import { NextFunction, Request, Response } from "express";
import { InventoryUpdateDTOSchema } from "../schemas";
import prisma from "@/prisma";

const updateInventory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const inventory = await prisma.inventory.findUnique({
			where: { id },
		});

		if (!inventory) {
			return res.status(404).json({
				success: false,
				message: "Inventory not found",
			});
		}

		const { error } = InventoryUpdateDTOSchema.safeParse(req.body);
		if (error) {
			return res.status(400).json({
				success: false,
				message: error.errors,
			});
		}

		const lastInventory = await prisma.history.findFirst({
			where: {
				inventoryId: id,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		let newQuantity = inventory.quantity;
		if (req.body.actionType === "IN") {
			newQuantity += req.body.quantity;
		} else if (req.body.actionType === "OUT") {
			newQuantity -= req.body.quantity;
		} else {
			return res.status(400).json({
				success: false,
				message: "Invalid action type",
			});
		}

		const updatedInventory = await prisma.inventory.update({
			where: { id },
			data: {
				quantity: newQuantity,
				histories: {
					create: {
						actionType: req.body.actionType,
						quantityChanged: req.body.quantity,
						lastQuantity: lastInventory?.newQuantity || 0,
						newQuantity,
					},
				},
			},
			select: {
				id: true,
				quantity: true,
			},
		});

		return res.status(200).json({
			success: true,
			message: "Inventory updated successfully",
			data: inventory,
		});
	} catch (error) {
		next(error);
	}
};

export default updateInventory;
