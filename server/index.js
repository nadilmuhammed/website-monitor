import express from "express";
import axios from "axios";
import mongoose from "mongoose";
import cors from "cors"
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose.connect('mongodb://localhost:27017/website-monitor');

const websiteSchema = new mongoose.Schema({
  url: String,
  status: String,
  responseTime: Number,
  lastChecked: Date,
});

const Website = mongoose.model('Website', websiteSchema);

app.get('/api/websites', async (req, res) => {
  const websites = await Website.find();
  res.json(websites);
});

app.post('/api/websites', async (req, res) => {
  const { url } = req.body;
  const website = new Website({ url });
  await website.save();

  await checkWebsite(website);

  res.json(website);

  io.emit('websiteAdded', website);
});

app.delete('/api/websites/:id', async (req, res) => {
  const { id } = req.params;
  await Website.findByIdAndDelete(id);
  res.sendStatus(204);

  io.emit('websiteDeleted', id);
});

const checkWebsite = async (website) => {
      try {
        const start = Date.now();
        const response = await axios.get(website.url);
        const end = Date.now();
        
        website.status = response.status === 200 ? 'Online' : 'Offline';
        website.responseTime = end - start;
      } catch (error) {
        website.status = 'Offline';
        website.responseTime = null;
      }
      website.lastChecked = new Date();
      
      // Save the updated website status to the database
      await website.save();

      io.emit('websiteUpdated', website);
  };

  const checkWebsites = async () => {
    const websites = await Website.find();
    for (let website of websites) {
      await checkWebsite(website);
    }
  };

// Immediately check all websites at startup
checkWebsites();

// Set up a regular interval to check websites every 5 minutes
setInterval(checkWebsites,10 * 1000);


server.listen(5000, () => console.log('Server running on http://localhost:5000'));
