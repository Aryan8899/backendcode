import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// Add this after your imports
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import CameraStreams from './CameraStreams';
import { Popup } from 'react-leaflet';
import Case from "./Case";
//import {  Ti Marker, Popup } from 'react-leaflet';

// Fix Leaflet's default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // New state for alert file upload
  const [alertImage, setAlertImage] = useState(null);
  const [alertImagePreview, setAlertImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    lastSeenLocation: '',
    description: '',
  });

  const [cameraForm, setCameraForm] = useState({
    location: '',
    rtspUrl: '',
    latitude: '',
    longitude: ''
  });

  const [alertForm, setAlertForm] = useState({
    message: '',
    cameraId: '', // Camera reference
    caseId: '',   // Case reference
    policeStationNumber: 'Local Station' // Default value
  });
  
  const [alertMessage, setAlertMessage] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to center of India
const [mapZoom, setMapZoom] = useState(5);
const [tipForm, setTipForm] = useState({
  name: '',
  email: '',
  message: '',
  caseId: ''
});


  const token = localStorage.getItem('token');

  


  const handleTipFormChange = (e) => {
    setTipForm({
      ...tipForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleTipSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/tips/submit', tipForm);
      alert('✅ Tip submitted!');
      setTipForm({ name: '', email: '', message: '', caseId: '' });
      fetchTipLeaderboard(); // Refresh leaderboard
    } catch (err) {
      console.error('Tip submission failed:', err);
      alert('❌ Failed to submit tip.');
    }
  };
  

  const handleAlertFormChange = (e) => {
    setAlertForm({
      ...alertForm,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    loadAllData();
  }, []);


  // Map click handler component
function MapClickHandler({ setCameraForm, cameraForm }) {
  const map = useMapEvents({
    click: (e) => {
      setCameraForm({
        ...cameraForm,
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      });
    }
  });
  return null;
}

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchCases(),
      fetchCameras(),
      fetchAlerts(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    setCameraForm({
      ...cameraForm,
      latitude: lat,
      longitude: lng
    });
    
    // Optionally use reverse geocoding to get location name
    // This requires additional API calls to a geocoding service
    // For simplicity, you can have users manually enter location name
  }

  const fetchCases = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCases(res.data);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

// ✅ This is correct, keep this
useEffect(() => {
    loadAllData();
  }, []);
  

  const fetchCameras = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cctv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCameras(res.data);
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const [tipLeaders, setTipLeaders] = useState([]);

const fetchTipLeaderboard = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/tips/leaderboard');
    setTipLeaders(res.data);
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
  }
};

useEffect(() => {
  fetchTipLeaderboard();
}, []);


  const handleInputChange = (e, form, setForm) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // New handler for alert image file upload
  const handleAlertImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAlertImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAlertImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

 
// Dashboard.js - Update the handleStatusUpdate function
// Updated handleStatusUpdate function for Dashboard.js
// Updated handleStatusUpdate function for Dashboard.js
const handleStatusUpdate = async (caseId, newStatus) => {
  try {
    console.log(`Updating case ${caseId} to status: ${newStatus}`);
    
    // Make the status update request without token (since backend doesn't require it)
    const response = await axios.patch(
      `http://localhost:5000/api/cases/status/${caseId}`,
      { status: newStatus },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000
      }
    );
    
    console.log('Status update response:', response.data);
    
    // On successful update, update the local state instead of refetching
    setCases(prevCases => 
      prevCases.map(c => 
        c._id === caseId ? { ...c, status: newStatus } : c
      )
    );
    
    alert(`Case marked as ${newStatus}`);
  } catch (err) {
    console.error('Status update failed:', err);
    
    // More detailed error logging for debugging
    if (err.response) {
      console.error('Error response:', err.response.data);
      console.error('Status code:', err.response.status);
      alert(`Server error: ${err.response.status} - ${err.response.data.error || 'Unknown error'}`);
    } else if (err.request) {
      console.error('No response received:', err.request);
      alert('Server connection error. Is the server running?');
    } else {
      console.error('Request setup error:', err.message);
      alert(`Error: ${err.message}`);
    }
  }
};
  
  

  const handleCaseSubmit = async (e) => {
    e.preventDefault();
  
    const GEOCODING_API_KEY = '12201c0b68df436780c7b7ee508ca82e';
  
    try {
      // Step 1: Geocode the lastSeenLocation
      const geoRes = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          key: GEOCODING_API_KEY,
          q: formData.lastSeenLocation
        }
      });
  
      const { results } = geoRes.data;
      const coordinates = results[0]?.geometry;
  
      if (!coordinates) {
        alert('❌ Could not determine coordinates for the given location.');
        return;
      }
  
      // Step 2: Create FormData
      const caseFormData = new FormData();
      Object.keys(formData).forEach(key => {
        caseFormData.append(key, formData[key]);
      });
  
      caseFormData.append('latitude', coordinates.lat);
      caseFormData.append('longitude', coordinates.lng);
  
      if (selectedFile) {
        caseFormData.append('image', selectedFile);
      }
  
      // Step 3: Submit case
      await axios.post('http://localhost:5000/api/cases', caseFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
  
      alert('✅ Case reported successfully!');
      setFormData({
        name: '',
        age: '',
        gender: '',
        lastSeenLocation: '',
        description: '',
      });
      setSelectedFile(null);
      setPreview(null);
      await loadAllData(); // ✅ ensures everything re-fetches


  
    } catch (err) {
      console.error('Case submission failed:', err);
      alert('❌ Failed to submit case.');
    }
  };


  useEffect(() => {
    const interval = setInterval(() => {
      loadAllData();
    }, 30000); // every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  

  const handleCameraSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/cctv', cameraForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('✅ Camera registered successfully!');
      setCameraForm({ location: '', rtspUrl: '' });
      fetchCameras();
    } catch (err) {
      console.error('Camera registration failed:', err);
      alert('❌ Failed to register camera.');
    }
  };

  // Updated alert submission function to handle file upload
  const handleAlertSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData object for multipart/form-data
      const alertFormData = new FormData();
      
      // Append text fields
      Object.keys(alertForm).forEach(key => {
        alertFormData.append(key, alertForm[key]);
      });
      
      // Append the image file if selected
      if (alertImage) {
        alertFormData.append('image', alertImage);
      }
      
      const response = await axios.post('http://localhost:5000/api/alerts', alertFormData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });
      
      if (response.status === 201) {
        setAlertMessage('Alert sent successfully. Contact our nearest railway station.');
        setAlertForm({
          message: '',
          cameraId: '',
          caseId: '',
          policeStationNumber: 'Local Station'
        });
        setAlertImage(null);
        setAlertImagePreview(null);
        
        // Refresh the alerts list
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to submit alert:', err);
      setAlertMessage(err.response?.data?.message || 'Failed to send alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="missing-persons-app bg-gradient-to-br from-blue-100 to-indigo-200 min-h-screen p-6">
    {/* Header Section */}
    <header className="text-center mb-8 pt-4">
    <h1 className="text-4xl font-bold text-indigo-800 text-stroke-white ">
  Missing Persons Portal
</h1>
<p className="text-purple-600 text-lg text-stroke-white">
  Help us reunite families
</p>


    </header>
  
    {loading && (
      <div className="flex justify-center my-4">
        <div className="animate-pulse flex space-x-4 items-center bg-white p-4 rounded-lg shadow-md">
          <div className="w-10 h-10 rounded-full bg-indigo-300"></div>
          <div className="text-lg text-indigo-600 font-medium">Loading data...</div>
        </div>
      </div>
    )}
  
    {/* Reported Cases */}
    <section className="mb-8 rounded-xl shadow-lg overflow-hidden bg-white border-2 border-indigo-200">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Reported Cases
        </h3>
      </div>
      
      <div className="p-6">
        {cases.length > 0 ? (
          <div className="max-h-96 overflow-y-auto space-y-4">
            {cases.map((c) => (
              <div 
                key={c._id} 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300 flex"
              >
                {c.image && (
                  <div className="mr-4 flex-shrink-0">
                    <img 
                      src={c.image.startsWith('http') ? c.image : `http://localhost:5000${c.image}`}
                      alt={c.name} 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-indigo-200"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <h4 className="text-xl font-semibold text-indigo-800 mb-1">{c.name}</h4>
                  <div className="mb-2 text-gray-700">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm mr-2">
                      {c.age} years
                    </span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-sm">
                      {c.gender}
                    </span>
                  </div>
                  <div className="mb-2">
                    <span className="font-medium text-gray-700">Status: </span>
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      c.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      c.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <p className="mb-2 text-gray-700">
                    <span className="font-medium">Last seen:</span> {c.lastSeenLocation}
                  </p>
                  {c.description && (
                    <p className="text-gray-600 text-sm border-l-4 border-indigo-300 pl-3 italic">
                      {c.description}
                    </p>
                  )}
                  <div className="mt-3 flex space-x-2">
                    {c.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusUpdate(c._id, 'Approved')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Approve
                      </button>
                    )}
                    {c.status !== 'Resolved' && (
                      <button
                        onClick={() => handleStatusUpdate(c._id, 'Resolved')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm transition-colors duration-200 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-blue-700 font-medium">No reported cases yet.</p>
          </div>
        )}
      </div>
    </section>
  
    {/* Submit a Public Tip */}
    <section className="mb-8 rounded-xl shadow-lg overflow-hidden bg-white border-2 border-amber-200">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <h3 className="text-2xl font-bold text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          Submit a Public Tip
        </h3>
      </div>
      
      <div className="p-6 bg-gradient-to-b from-amber-50 to-white">
        <form onSubmit={handleTipSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={tipForm.name}
              onChange={handleTipFormChange}
              required
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1">Your Email (optional)</label>
            <input
              type="email"
              name="email"
              placeholder="your.email@example.com"
              value={tipForm.email}
              onChange={handleTipFormChange}
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1">Related Case</label>
            <select
              name="caseId"
              value={tipForm.caseId}
              onChange={handleTipFormChange}
              required
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white"
            >
              <option value="">-- Select Related Case --</option>
              {cases.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.age}, {c.gender})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-amber-700 mb-1">Your Tip Information</label>
            <textarea
              name="message"
              placeholder="Describe what you saw in detail..."
              value={tipForm.message}
              onChange={handleTipFormChange}
              required
              className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 min-h-24"
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Submit Tip
          </button>
        </form>
      </div>
    </section>
    
    {/* Footer */}
   
  </div>
  );
};

export default Dashboard;