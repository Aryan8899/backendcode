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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-100 font-sans antialiased">
    {/* Animated Header with Dynamic Gradient */}
    <header className="relative bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white py-16 px-6 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 opacity-70 animate-pulse"></div>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 animate-gradient-x">
          Missing Persons Registry
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto font-light tracking-wide">
          Empowering Communities to Reunite Families Through Collaborative Search and Support
        </p>
      </div>
    </header>

    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Report New Case Section with Enhanced Design */}
      <section className="mb-12 rounded-3xl bg-white shadow-2xl border-2 border-blue-100 overflow-hidden transform transition-all hover:scale-[1.02]">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-900 px-6 py-5">
          <div className="flex items-center">
            <div className="bg-white p-3 rounded-full shadow-lg transform hover:rotate-6 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="ml-4 text-3xl font-bold text-white tracking-wide">Report New Case</h3>
          </div>
        </div>
        
        <form onSubmit={handleCaseSubmit} className="p-8 space-y-6 bg-gradient-to-br from-blue-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Input fields with enhanced styling */}
            {['name', 'age', 'gender', 'lastSeenLocation'].map((field) => (
              <div key={field} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 capitalize">
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                {field === 'gender' ? (
                  <select
                    name={field}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(e, formData, setFormData)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type={field === 'age' ? 'number' : 'text'}
                    name={field}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    value={formData[field]}
                    onChange={(e) => handleInputChange(e, formData, setFormData)}
                    className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 shadow-sm"
                    required
                  />
                )}
              </div>
            ))}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
            <textarea
              name="description"
              placeholder="Provide comprehensive details about the missing person, including physical description, clothing, and last known circumstances"
              value={formData.description}
              onChange={(e) => handleInputChange(e, formData, setFormData)}
              className="w-full px-4 py-3 border border-blue-200 rounded-xl min-h-[150px] resize-y focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 shadow-sm"
              required
            />
          </div>
          
          {/* Enhanced File Upload with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Recent Photograph
            </label>
            <div className="w-full border-2 border-dashed border-blue-300 rounded-xl p-6 text-center hover:bg-blue-50 transition-colors group">
              <input 
                type="file" 
                className="hidden" 
                id="file-upload"
                accept="image/*" 
                onChange={handleFileChange}
              />
              <label 
                htmlFor="file-upload" 
                className="cursor-pointer flex flex-col items-center justify-center space-y-4"
              >
                <svg className="w-12 h-12 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-gray-600 group-hover:text-blue-700 transition-colors">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX 2MB)</p>
              </label>
            </div>
            
            {preview && (
              <div className="mt-6 flex justify-center">
                <div className="relative group">
                  <img 
                    src={preview} 
                    alt="Photo Preview" 
                    className="max-h-64 rounded-xl shadow-lg border-4 border-white group-hover:scale-105 transition-transform"
                  />
                  <button 
                    type="button"
                    onClick={() => setPreview(null)}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit" 
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-2xl hover:shadow-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Submit Missing Person Report
            </button>
          </div>
        </form>
      </section>
    
      {/* Time-Based Disappearance Map with Enhanced Styling */}
      <section className="rounded-3xl bg-white shadow-2xl border-2 border-indigo-100 overflow-hidden transform transition-all hover:scale-[1.02]">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-5">
          <div className="flex items-center">
            <div className="bg-white p-3 rounded-full shadow-lg transform hover:rotate-6 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="ml-4 text-3xl font-bold text-white tracking-wide">Disappearance Tracking Map</h3>
          </div>
        </div>
        
        <div className="p-8 bg-gradient-to-br from-indigo-50 to-white">
          {/* Case Status Legend with Enhanced Design */}
          <div className="bg-indigo-100 p-5 rounded-xl mb-6 border-l-4 border-indigo-500 flex items-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Case Status Timeline</h4>
              <div className="flex flex-wrap gap-4">
                {[
                  { color: 'green-500', label: 'Recent (7 days)', desc: 'Newly reported cases' },
                  { color: 'orange-500', label: 'Ongoing (7-30 days)', desc: 'Active investigations' },
                  { color: 'red-500', label: 'Long-term (30+ days)', desc: 'Extended search needed' }
                ].map(({ color, label, desc }) => (
                  <div key={label} className="flex items-center">
                    <span className={`h-5 w-5 rounded-full bg-${color} mr-2 shadow-md`}></span>
                    <div>
                      <span className="font-medium text-gray-800">{label}</span>
                      <p className="text-xs text-gray-600">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Map Container with Enhanced Styling */}
          <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-indigo-100">
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
                          <p><span className = "font-medium text-gray-700">Last seen:</span> <span className="text-gray-900">{c.lastSeenLocation}</span></p>
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;