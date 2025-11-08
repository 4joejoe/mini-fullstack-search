import express, { json, Request, Response } from "express";
import { search_controller } from "./controller/serach.controller";

const app = express();
app.use(json());

// search route
app.post("/api/search", search_controller);

// route error handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

app.listen(8000, () => {
  console.log("App is running on PORT 8000");
});
