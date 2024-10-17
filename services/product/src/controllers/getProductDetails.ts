import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import axios from "axios";

const getProductDetails = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const product = await prisma.product.findUnique({
			where: { id: req.params.id },
		});

		if (!product) {
			return res.status(404).json({ success: false, message: "Product not found" });
		}

		if (product.inventoryId === null) {
			const { data } = await axios.post(`${process.env.INVENTORY_URL}/inventories`, {
				productId: product.id,
				sku: product.sku,
			});

			await prisma.product.update({
				where: { id: product.id },
				data: { inventoryId: data.inventory.id },
			});

			return res.status(200).json({
				success: true,
				product,
				inventoryId: data.inventory.id,
				stock: data.inventory.quantity || 0,
				stockStatus: data.inventory.quantity > 0 ? "In stock" : "Out of stock",
			});
		}

		const { data } = await axios.get(
			`${process.env.INVENTORY_URL}/inventories/${product.inventoryId}`
		);

		console.log(data);

		res.status(200).json({
			success: true,
			product: {
				...product,
				stock: data.data.quantity || 0,
				stockStatus: data.data.quantity > 0 ? "In stock" : "Out of stock",
			},
		});
	} catch (error) {
		next(error);
	}
};

export default getProductDetails;
