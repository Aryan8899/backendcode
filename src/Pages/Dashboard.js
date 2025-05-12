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
import ReportedCase from "./ReportedCase";
import PublicTip from "./PublicTip";
import Alert from "./Alert";
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
    <div className="bg-gradient-to-br from-blue-100 to-indigo-200 "style={{ 
     
      fontFamily: 'Poppins, Arial, sans-serif',
     
     
    }}>
      
    
      {loading && <p style={{ 
        color: '#5d6a82',
        background: '#f8faff',
        padding: '12px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>Loading data...</p>}
    
      {/* Report New Case */}
      <div style={{
       
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        border: '1px solid #eaefff'
      }}>
        <h3 style={{ 
          color: '#3a4d7c', 
          marginBottom: '16px', 
          fontSize: '20px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center'
        }}>
         
        </h3>
        <Case/>
      </div>
    
      <div style={{
       
       
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
       
      }}>
        <h3 style={{ 
          color: '#3a4d7c', 
          marginBottom: '16px', 
          fontSize: '20px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center'
        }}>
         
        </h3>
        <ReportedCase/>
      </div>
    
      {/* Public Tip Leaderboard */}
      <div style={{
       
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        border: '1px solid #eaefff'
      }}>
        <h3 style={{ 
          color: '#3a4d7c', 
          marginBottom: '16px', 
          fontSize: '20px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center'
        }}>
          
        </h3>
        <PublicTip/>
      </div>
    
      {/* Alerts */}
      <div style={{
       
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
      
      }}>
        <h3 style={{ 
          color: '#3a4d7c', 
          marginBottom: '16px', 
          fontSize: '20px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center'
        }}/>
          
        <Alert/>
      </div>
    </div>
  );
};

export default Dashboard;