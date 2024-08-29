import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import warning from "./assets/audio/warning.mp3" 

function App() {
  const [loading, setLoading] = useState(false);
  const [loadDelete, setLoadDelete] = useState(false);
  
  const [websites, setWebsites] = useState([]);
  const [error, setError] = useState(false);
  const [url, setUrl] = useState("");
  const [isMuted, setIsMuted] = useState(false);


  const audioRef = useRef(new Audio(warning));

  useEffect(() => {
    const socket = io("http://localhost:5000");
    fetchWebsites();

    socket.on("websiteAdded", (newWebsite) => {
      setWebsites((prevWebsites) => [...prevWebsites, newWebsite]);
    });

    socket.on("websiteUpdated", (updatedWebsite) => {
      setWebsites((prevWebsites) =>
        prevWebsites.map((website) =>
          website._id === updatedWebsite._id ? updatedWebsite : website
        )
      );
    });

    socket.on("websiteDeleted", (id) => {
      setWebsites((prevWebsites) =>
        prevWebsites.filter((website) => website._id !== id)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // useEffect(() => {
  //   const offlineWebsites = websites.filter(website => website.status !== "Online");
  //   console.log(offlineWebsites)

  //   if (offlineWebsites && !isMuted) {
  //     audioRef.current.play();
  //   } else {
  //     audioRef.current.pause();
  //   }
  // }, [websites, isMuted]);

  const fetchWebsites = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/websites");
      if (response.data) {
        setWebsites(response.data);
      }
    } catch (error) {
      console.log(error.message);
      toast.error(error.response.data.message);
    }
  };

  const addWebsite = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/websites", {
        url,
      });
      setWebsites([...websites, response.data]);
      setUrl("");
      toast.success("Url added");
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      toast.error(error.response.data.message);
    }
  };

  const deleteWebsite = async (id) => {
    setLoadDelete(true);
    await axios.delete(`http://localhost:5000/api/websites/${id}`);
    setWebsites(websites.filter((website) => website._id !== id));
    setLoadDelete(false);
  };

  // const toggleMute = () => {
  //   setIsMuted(!isMuted);
  //   if (!isMuted) {
  //     audioRef.current.pause();
  //   }
  // };

  return (
    <>
      {loading || loadDelete ? (
        <div>Loading...</div>
      ) : (
        <div className="container mx-auto p-2 md:p-4">
          <h1 className="text-3xl font-bold text-center mb-4">
            Website Monitoring
          </h1>

          <div className="flex justify-center mb-4">
            <input
              type="text"
              className="border rounded px-3 py-2 mr-2"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            {error && (
              <div className="text-red-500">Please enter a website URL</div>
            )}
            <button
              className="bg-blue-500 text-white rounded px-4 py-2"
              onClick={addWebsite}
            >
              Add Website
            </button>
          </div>


          <div className="grid grid-cols-1 gap-4 mt-14 text-gray-800">
            {websites.map((website) => (
              <div
                key={website._id}
                className={`rounded-xl flex justify-between items-center p-2 md:p-4 ${website.status === "Online" ? 'bg-green-100' : 'bg-red-100'}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-[12px] h-[12px] rounded-full ${website.status === "Online" ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <h2 className="text-xl font-semibold">{website.url}</h2>
                  </div>
                  <p className="ml-5">
                    {website.lastChecked
                      ? new Date(website.lastChecked).toLocaleString()
                      : "Checking...."}
                  </p>
                </div>
                <div>
                  <button
                    className="bg-red-500 text-white rounded px-2 py-1"
                    onClick={() => deleteWebsite(website._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
