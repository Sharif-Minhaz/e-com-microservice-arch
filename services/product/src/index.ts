import express, { RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { createProduct, getProducts, getProductDetails } from "./controllers";

dotenv.config();

const app = express();

const port = process.env.PORT || 4001;
const serviceName = process.env.SERVICE_NAME || "Product-Service";

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
	res.json({ status: "UP" });
});

app.use((req, res, next) => {
	const allowedOrigins = ["http://localhost:8081", "http://127.0.0.1:8081"];
	const origin = req.headers.origin || "";
	if (allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		next();
	} else {
		res.status(403).json({ message: "Forbidden" });
	}
});

app.get("/products/:id", getProductDetails as RequestHandler);
app.post("/products", createProduct as RequestHandler);
app.get("/products", getProducts as RequestHandler);

// 404 handler
app.use((_req, res, _next) => {
	res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
	res.status(500).json({ success: false, message: err.message });
});

app.listen(port, () => {
	console.log(`${serviceName} is running on port ${port}`);
});
