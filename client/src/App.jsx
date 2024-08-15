import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function App() {
  const [loading, setLoading] = useState(false);
  const [ loadDelete, setLoadDelete ] = useState(false);

  const [websites, setWebsites] = useState([]);
  const [ error, setError ] = useState(false);
  const [url, setUrl] = useState("");
  
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

    return () =>{
      socket.disconnect();
    }
  }, []);


  const fetchWebsites = async () => {
    const response = await axios.get("http://localhost:5000/api/websites");
    if (response.data) {
      setWebsites(response.data);
    }
  };

  const addWebsite = async () => {

    setLoading(true);
    const response = await axios.post("http://localhost:5000/api/websites", {
      url,
    });
    setWebsites([...websites, response.data]);
    setUrl("");
    setLoading(false);
  };

  const deleteWebsite = async (id) => {
    setLoadDelete(true)
    await axios.delete(`http://localhost:5000/api/websites/${id}`);
    setWebsites(websites.filter((website) => website._id !== id));
    setLoadDelete(false);
  };

  return (
    <>
      {loading || loadDelete ? (
        <div>Loading...</div>
      ) : (
        <div className="container mx-auto p-4">
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

          <div className="grid grid-cols-1 gap-4">
            {websites.map((website) => (
              <div key={website._id} className="border rounded p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">{website.url}</h2>
                  <button
                    className="bg-red-500 text-white rounded px-3 py-1"
                    onClick={() => deleteWebsite(website._id)}
                  >
                    Delete
                  </button>
                </div>
                <p>Status: {website.status || "Checking..."}</p>
                <p>
                  Response Time:{" "}
                  {website.responseTime ? `${website.responseTime}ms` : "N/A"}
                </p>
                <p>
                  Last Checked:{" "}
                  {website.lastChecked
                    ? new Date(website.lastChecked).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
