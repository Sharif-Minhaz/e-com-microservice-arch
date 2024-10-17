import prisma from "../prisma";
import { ProductCreateDTOSchema } from "@/schemas";
import { Request, Response, NextFunction } from "express";
import axios from "axios";

const createProduct = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedBody = ProductCreateDTOSchema.safeParse(req.body);

		if (!parsedBody.success) {
			return res.status(400).json({ success: false, error: parsedBody.error.errors });
		}

		const existingProduct = await prisma.product.findUnique({
			where: { sku: parsedBody.data.sku },
		});

		if (existingProduct) {
			return res
				.status(400)
				.json({ success: false, error: "Product with this SKU already exists" });
		}

		// Create product
		const product = await prisma.product.create({
			data: parsedBody.data,
		});

		// Create inventory for the product
		const { data } = await axios.post(`${process.env.INVENTORY_URL}/inventories`, {
			productId: product.id,
			sku: product.sku,
		});

		// update product with inventory id
		await prisma.product.update({
			where: { id: product.id },
			data: { inventoryId: data.inventory.id },
		});

		res.status(201).json({
			success: true,
			product: { ...product, inventoryId: data.inventory.id },
		});
	} catch (error) {
		next(error);
	}
};

export default createProduct;
