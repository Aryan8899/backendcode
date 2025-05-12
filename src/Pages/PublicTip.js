import React, { useEffect, useState,useCallback } from 'react';
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
import ReportedCase from "./ReportedCase";
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
  const [tipSubmitting, setTipSubmitting] = useState(false);
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
    setTipSubmitting(true);
    try {
      // Log before submission
      console.log("Submitting tip:", tipForm);
      
      // Make the API call
      const response = await axios.post('http://localhost:5000/api/tips/submit', tipForm);
      console.log("Tip submission response:", response.data);
      
      // Show success message
      alert('✅ Tip submitted!');
      
      // Reset form
      setTipForm({ name: '', email: '', message: '', caseId: '' });
      
      // Directly fetch the updated leaderboard
      // To ensure we get fresh data, we'll await the result
      console.log("Fetching updated leaderboard...");
      try {
        const leaderboardData = await axios.get('http://localhost:5000/api/tips/leaderboard');
        console.log("Leaderboard data received:", leaderboardData.data);
        setTipLeaders(leaderboardData.data); // Directly update state

        await fetchCases(); 
      } catch (leaderboardErr) {
        console.error("Failed to fetch leaderboard:", leaderboardErr);
      }
      
      // Also trigger full data refresh to ensure everything is in sync
      await loadAllData();
      
    } catch (err) {
      console.error('Tip submission failed:', err);
      alert(`❌ Failed to submit tip: ${err.response?.data?.message || err.message}`);
    } finally {
      setTipSubmitting(false);
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

const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchCases(),
        fetchCameras(),
        fetchAlerts(),
        fetchStats(),
        fetchTipLeaderboard()
      ]);
    } catch (error) {
      console.error("Failed to load all data:", error);
      alert("Failed to refresh data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);  // Empty dependency array since these functions don't depend on state

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
      return res.data;
    } catch (err) {
      console.error('Failed to fetch cases:', err);
      throw err;
    }
  };

  const fetchCameras = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cctv', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCameras(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch cameras:', err);
      throw err;
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
      throw err;
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      throw err;
    }
  };

  const [tipLeaders, setTipLeaders] = useState([]);

const fetchTipLeaderboard = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/tips/leaderboard');
    setTipLeaders([...res.data]); // Instead of just setTipLeaders(res.data)

    //await loadAllData()
    return res.data;
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    throw err;
  }
};







const [refreshInterval, setRefreshInterval] = useState(30000); // refresh every 30 seconds by default



useEffect(() => {
    // Initial data load
    loadAllData();
    
    // Set up interval for automatic refreshing
    const intervalId = setInterval(() => {
      loadAllData();
    }, refreshInterval);
    
    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
}, [refreshInterval, loadAllData]); // Only depend on refreshInterval


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

    await loadAllData(); 
    
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
      fetchCases();

      console.log(cases);

      await loadAllData();
    // Add this after successful submissions

    } catch (err) {
      console.error('Case submission failed:', err);
      alert('❌ Failed to submit case.');
    }
  };
  

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
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
   

      {loading && <p style={{ color: '#666' }}>Loading data...</p>}

      {/* Report New Case */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refreshing data...
        </div>
      )}



      {/* Reported Cases */}

{/* 🏆 Public Tip Leaderboard */}
<section className="mb-8 rounded-xl shadow-lg overflow-hidden bg-white border-2 border-teal-200">
  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
    <h3 className="text-2xl font-bold text-white flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
      Public Tip Leaderboard
    </h3>
  </div>

  <div className="p-6 bg-gradient-to-b from-teal-50 to-white">
    {tipLeaders.length > 0 ? (
      <div className="space-y-3">
        {tipLeaders.map((user, index) => (
          <div 
            key={index} 
            className={`flex items-center p-3 rounded-lg ${
              index === 0 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-400' : 
              index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400' : 
              index === 2 ? 'bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-600' : 
              'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400'
            } transition-transform duration-200 hover:scale-102 shadow-sm hover:shadow`}
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-inner border border-gray-200 mr-4">
              <span className="text-xl">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🎖️'}
              </span>
            </div>
            
            <div className="flex-grow">
              <div className="font-bold text-gray-800">{user._id}</div>
              <div className="flex items-center text-sm">
                <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
                  {user.tipCount} tip{user.tipCount > 1 ? 's' : ''}
                </span>
                
                {user.email && (
                  <span className="ml-2 text-gray-500 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {user.email}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-shrink-0 text-2xl font-bold text-teal-800">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-teal-50 p-4 rounded-lg text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-teal-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-teal-700 font-medium">No tips submitted yet.</p>
        <p className="text-teal-600 text-sm mt-1">Be the first to help and lead the board!</p>
      </div>
    )}
  </div>
</section>

{/* 🚨 Create Alert Section */}
<section className="mb-8 rounded-xl shadow-lg overflow-hidden bg-white border-2 border-red-200">
  <div className="bg-gradient-to-r from-red-500 to-rose-500 px-6 py-4">
    <h3 className="text-2xl font-bold text-white flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Create Alert
    </h3>
  </div>

  <div className="p-6 bg-gradient-to-b from-red-50 to-white">
    <form onSubmit={handleAlertSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-red-700 mb-1">Alert Message</label>
          <textarea
            name="message"
            placeholder="Describe the alert in detail..."
            value={alertForm.message}
            onChange={handleAlertFormChange}
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 min-h-24"
            required
          />
        </div>
        
        {/* File Upload for Alert Image */}
        <div>
          <label className="block text-sm font-medium text-red-700 mb-1">Upload Alert Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-red-300 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-red-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500">
                  <span>Upload an image</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only"
                    accept="image/*"
                    onChange={handleAlertImageChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          
          {alertImagePreview && (
            <div className="mt-3 p-2 border border-red-200 rounded-lg bg-white">
              <div className="relative">
                <img 
                  src={alertImagePreview} 
                  alt="Alert Preview" 
                  className="rounded-md mx-auto max-h-36 object-contain"
                />
                <button 
                  type="button"
                  onClick={() => {
                    // Clear image preview function would go here
                    // Handle this based on your implementation
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Case Dropdown - Required Selection */}
        <div>
          <label className="block text-sm font-medium text-red-700 mb-1">
            Select Related Case <span className="text-red-500">*</span>
          </label>
          <select
            name="caseId"
            value={alertForm.caseId}
            onChange={handleAlertFormChange}
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white"
            required
          >
            <option value="">-- Select Related Case --</option>
            {cases.map(caseItem => (
              <option key={caseItem._id} value={caseItem._id}>
                {caseItem.name} ({caseItem.age}, {caseItem.gender})
              </option>
            ))}
          </select>
        </div>
        
        {/* Camera Dropdown */}
        <div>
          <label className="block text-sm font-medium text-red-700 mb-1">Select Camera (Optional)</label>
          <select
            name="cameraId"
            value={alertForm.cameraId}
            onChange={handleAlertFormChange}
            className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-white"
          >
            <option value="">-- Select Camera --</option>
            {cameras.map(camera => (
              <option key={camera._id} value={camera._id}>
                {camera.location}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-red-700 mb-1">Police Station Number</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              type="text"
              name="policeStationNumber"
              placeholder="Enter police contact number"
              value={alertForm.policeStationNumber}
              onChange={handleAlertFormChange}
              className="w-full pl-10 px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>
      
      <button 
        type="submit" 
        className={`w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center ${
          loading || !alertForm.caseId ? 'opacity-60 cursor-not-allowed' : ''
        }`}
        disabled={loading || !alertForm.caseId}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Alert
          </>
        )}
      </button>
    </form>
    
    {alertMessage && (
      <div className={`mt-4 p-4 rounded-lg ${
        alertMessage.includes('Failed') 
          ? 'bg-red-100 border-l-4 border-red-500 text-red-700' 
          : 'bg-green-100 border-l-4 border-green-500 text-green-700'
      }`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {alertMessage.includes('Failed') ? (
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className="font-medium">{alertMessage}</p>
          </div>
        </div>
      </div>
    )}
  </div>
</section>
      {/* Face Match Alerts - CORRECTED SECTION */}
   


      

      {/* Stats */}

    </div>
  );
};

export default Dashboard;