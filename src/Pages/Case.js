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
    const response = await axios.post('http://localhost:5000/api/cases', caseFormData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
    });

    // Step 4: Add the new case to the state immediately
    const newCase = response.data;
    setCases(prevCases => [...prevCases, newCase]);

    // Step 5: Center the map on the new case location
    setMapCenter([coordinates.lat, coordinates.lng]);
    setMapZoom(13); // Zoom in to make the new case clearly visible

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

    // fetchCases() is no longer needed here as we've already updated the state

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 font-sans">
    {/* Header with Hero Section */}
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-6 shadow-lg">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Missing Persons Registry</h1>
        <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
          Help reunite families by reporting cases or exploring our interactive database
        </p>
      </div>
    </header>
  
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Report New Case Section */}
      <section className="mb-10 rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-900 px-6 py-4">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="ml-3 text-2xl font-bold text-white">Report New Case</h3>
          </div>
        </div>
        
        <form onSubmit={handleCaseSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange(e, formData, setFormData)}
                className="p-3 rounded-lg border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                placeholder="Enter age"
                value={formData.age}
                onChange={(e) => handleInputChange(e, formData, setFormData)}
                className="p-3 rounded-lg border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange(e, formData, setFormData)}
                className="p-3 rounded-lg border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200 bg-white"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Last Seen Location</label>
              <input
                type="text"
                name="lastSeenLocation"
                placeholder="Enter location"
                value={formData.lastSeenLocation}
                onChange={(e) => handleInputChange(e, formData, setFormData)}
                className="p-3 rounded-lg border border-gray-300 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Include clothing, distinguishing features, and circumstances of disappearance"
              value={formData.description}
              onChange={(e) => handleInputChange(e, formData, setFormData)}
              className="p-4 rounded-lg border border-gray-300 w-full min-h-[120px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
              required
            />
          </div>
          
          {/* File Upload Field with improved styling */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photo
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-all duration-200">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-10 h-10 mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  <p className="mb-1 text-sm text-gray-600">
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">JPEG, PNG, or JPG (MAX. 2MB)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
            {preview && (
              <div className="mt-4">
                <div className="relative inline-block group">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="h-40 object-cover rounded-md border border-gray-300 shadow-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => {
                      setPreview(null);
                      // Reset file input logic would go here
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 focus:outline-none shadow-md opacity-90 hover:opacity-100 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button 
              type="submit" 
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-300 flex items-center shadow-lg transform hover:translate-y-[-2px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Case
            </button>
          </div>
        </form>
      </section>
    
      {/* Time-Based Disappearance Map with improved styling */}
      <section className="rounded-xl bg-white shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="ml-3 text-2xl font-bold text-white">Time-Based Disappearance Map</h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-indigo-50 p-4 rounded-lg mb-6 flex items-center border-l-4 border-indigo-500 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm">
              <p className="font-semibold text-gray-700 mb-2">Case Status Legend:</p>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center">
                  <span className="h-4 w-4 rounded-full bg-green-500 mr-2 shadow-sm"></span> 
                  <span className="text-gray-700">Recent ( 7 days)</span>
                </span>
                <span className="inline-flex items-center">
                  <span className="h-4 w-4 rounded-full bg-orange-500 mr-2 shadow-sm"></span> 
                  <span className="text-gray-700">Ongoing (7-30 days)</span>
                </span>
                <span className="inline-flex items-center">
                  <span className="h-4 w-4 rounded-full bg-red-500 mr-2 shadow-sm"></span> 
                  <span className="text-gray-700">Long-term ( 30 days)</span>
                </span>
              </div>
            </div>
          </div>
          
          <div className="h-96 w-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {cases.filter(c => typeof c.latitude === 'number' && typeof c.longitude === 'number').map(c => {
                const daysOld = Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                let color = daysOld < 7 ? '#10b981' : daysOld < 30 ? '#f59e0b' : '#ef4444';
      
                const customIcon = L.divIcon({
                  className: 'custom-marker',
                  html: `<div class="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-sm font-bold text-white" style="background-color:${color}">${c.age}</div>`
                });
      
                return (
                  <Marker key={c._id} position={[c.latitude, c.longitude]} icon={customIcon}>
                    <Popup>
                      <div className="p-3">
                        <h4 className="font-bold text-lg border-b pb-2 mb-2 text-gray-800">{c.name}</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium text-gray-700">Age:</span> <span className="text-gray-900">{c.age}</span></p>
                          <p><span className="font-medium text-gray-700">Gender:</span> <span className="text-gray-900">{c.gender}</span></p>
                          <p><span className="font-medium text-gray-700">Last seen:</span> <span className="text-gray-900">{c.lastSeenLocation}</span></p>
                          <p><span className="font-medium text-gray-700">Missing for:</span> <span className="text-gray-900">{daysOld} day(s)</span></p>
                        </div>
                        {c.photoUrl && (
                          <img 
                            src={c.photoUrl} 
                            alt={c.name} 
                            className="mt-3 max-w-full h-28 object-cover rounded-md shadow-sm" 
                          />
                        )}
                        <div className="mt-3 pt-2 border-t flex justify-between items-center">
                          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </button>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Report Info
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          
          {/* <div className="mt-6 text-center">
            <button className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium hover:bg-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Load More Cases
            </button>
          </div> */}
        </div>
      </section>
    </div>
    
    {/* Footer */}
    {/* <footer className="mt-12 bg-gray-800 text-white py-8 px-6"> */}
      {/* <div className="max-w-6xl mx-auto"> */}
        {/* <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-2">Missing Persons Registry</h2>
            <p className="text-gray-300 text-sm">Helping reunite families since 2023</p>
          </div>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div> */}
        {/* <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; 2025 Missing Persons Registry. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300">Terms of Service</a>
            <a href="#" className="text-sm text-gray-400 hover:text-gray-300">Contact Us</a>
          </div>
        </div> */}
      {/* </div> */}
    {/* </footer> */}
  </div>
  );
};

export default Dashboard;