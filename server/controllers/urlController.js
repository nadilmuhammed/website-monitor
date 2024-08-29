import axios from "axios";
import { io } from "../index.js";
import Website from "../model/websiteModel.js";
import { BsVolumeMute, BsVolumeUp } from "react-icons/bs";


export const postUrl = async(req,res)=>{
    const { url } = req.body;
    try {
      const website = new Website({ url });
      await website.save();
    
      await checkWebsite(website);
    
      res.json(website);
    
      io.emit("websiteAdded", website);
    } catch (error) {
      console.error(error.message);
      res.status(400).json({ message: 'Internal Server error' });
    }
}

export const getUrl = async(req,res)=>{
  try {
    const websites = await Website.find();
    res.json(websites); 
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: 'Internal Server error' }); 
  }
}

export const deleteUrl = async(req,res)=>{
  const { id } = req.params;
  try {
    await Website.findByIdAndDelete(id);
    res.sendStatus(204);
  
    io.emit("websiteDeleted", id);
  } catch (error) {
    console.error(error.message);
    res.status(400).json({ message: 'Internal Server error' }); 
  }
}



const checkWebsite = async (website) => {
    try {
      const start = Date.now();
      const response = await axios.get(website.url);
      const end = Date.now();
  
      website.status = response.status >= 200 && response.status < 300 ? "Online" : "Offline";
      website.responseTime = end - start;
    } catch (error) {
      if (error.response) {
        // Server responded with a status code outside the 2xx range
        website.status = `Error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response was received
        website.status = "No Response";
      } else {
        // Something else happened in setting up the request
        website.status = `Request Error: ${error.message}`;
      }
      website.responseTime = null;
      // io.emit("websiteOffline", website);
    }
    website.lastChecked = new Date();
  
    // Save the updated website status to the database
    await website.save();
  
    io.emit("websiteUpdated", website);
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
  setInterval(checkWebsites, 10 * 1000);