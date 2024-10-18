import { Express, Request, Response } from "express";
import config from "./config.json";
import axios from "axios";

const createHandler = (host: string, path: string, method: string) => {
	return async (req: Request, res: Response) => {
		try {
			let url = `${host}${path}`;
			req.params &&
				Object.keys(req.params).forEach((param) => {
					url = url.replace(`:${param}`, req.params[param]);
				});

			const response = await axios({
				url,
				method,
				data: req.body,
				headers: {
					origin: "http://localhost:8081",
				},
			});

			res.status(response.status).json(response.data);
		} catch (error) {
			console.log(error);
			if (axios.isAxiosError(error)) {
				res.status(error.response?.status || 500).json({
					error: error.response?.data || "Internal Server Error",
				});
			} else {
				console.error(error);
				res.status(500).json({ error: "Internal Server Error" });
			}
		}
	};
};

export const configureRoutes = (app: Express) => {
	Object.entries(config.services).forEach(([_name, service]) => {
		const host = service.url;
		const routes = service.routes;

		routes.forEach((route) => {
			const methods = route.methods;
			const path = route.path;

			methods.forEach((method) => {
				const methodName = method.toLowerCase() as keyof Express;

				const handler = createHandler(host, path, method.toLowerCase());

				const apiPath = `/api${path}`;

				if (methodName in app && typeof app[methodName] === "function") {
					(app[methodName] as Function)(apiPath, handler);
				} else {
					console.error(`Unsupported HTTP method: ${String(methodName)}`);
				}
			});
		});
	});
};
