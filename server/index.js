import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import http from "http";
import { Server } from "socket.io";
import connect from "./db/connectDB.js";
import websiteRouter from "./routers/websiteRouter.js"
import path from "path";

dotenv.config();

const __dirname = path.resolve();

const app = express();
const port = process.env.PORT || 5000
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use("/api",websiteRouter)

app.use(express.static(path.join(__dirname,"/client/dist")))

app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"/client","/dist", "/index.html"))
})



server.listen(port, () => {
  connect();
  console.log("Server running on http://localhost:5000")
});
