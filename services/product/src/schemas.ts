import { ProductStatus } from "@prisma/client";
import { z } from "zod";

export const ProductCreateDTOSchema = z.object({
	sku: z.string().min(3).max(10),
	name: z.string().min(3).max(255),
	description: z.string().max(1000).optional(),
	price: z.number().default(0),
	inventoryId: z.string().optional(),
	status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
});
