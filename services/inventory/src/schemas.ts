import { ActionType } from "@prisma/client";
import { z } from "zod";

export const InventoryCreateDTOSchema = z.object({
	sku: z.string(),
	productId: z.string(),
	quantity: z.number().int().positive().default(0).optional(),
});

export const InventoryUpdateDTOSchema = z.object({
	quantity: z.number().int(),
	actionType: z.nativeEnum(ActionType),
});
