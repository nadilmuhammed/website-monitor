import express from "express";
// import axios from "axios";
// import Website from "./model/websiteModel.js";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import connect from "./db/connectDB.js";
import websiteRouter from "./routers/websiteRouter.js"
import path from "path";

const __dirname = path.resolve();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use("/api",websiteRouter)

app.use(express.static(path.join(__dirname,"/client/dist")))

app.get("*",(req,res)=>{
  res.sendFile(path.join(__dirname,"/client","/dist", "/index.html"))
})



server.listen(5000, () => {
  connect();
  console.log("Server running on http://localhost:5000")
});
