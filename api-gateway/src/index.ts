import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { configureRoutes } from "./utils";

dotenv.config();

const app = express();

app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	handler: (_req, res, _next) => {
		res.status(429).json({
			success: false,
			error: "Too many requests",
		});
	},
});

app.use("/api", limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

configureRoutes(app);

// health check
app.get("/health", (_req, res) => {
	res.status(200).json({
		success: true,
		message: "API Gateway is healthy",
	});
});

// 404 handler
app.use((_req, res, _next) => {
	res.status(404).json({
		success: false,
		error: "Not found",
	});
});

// error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.log(err);
	res.status(500).json({
		success: false,
		error: err.message,
	});
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
	console.log(`API Gateway listening on port ${PORT}`);
});
