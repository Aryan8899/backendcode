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

  useEffect(()=>{
    fetchAlerts();
  })

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
      await fetchCases();
      await fetchStats(); 

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
      await fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to submit alert:', err);
      setAlertMessage(err.response?.data?.message || 'Failed to send alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
        padding: '30px',
        fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
     
        borderRadius: '12px',
       
      }}>
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: '#e0f2fe',
            marginBottom: '20px'
          }}>
            <p style={{ 
              color: '#0369a1',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ 
                display: 'inline-block',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '3px solid #0369a1',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite'
              }}></span>
              Loading data...
            </p>
          </div>
        )}
      
        {/* View Alerts Section */}
        <section style={{ 
          marginBottom: '40px', 
          padding: '25px', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#334155',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              backgroundColor: '#f87171',
              color: 'white',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontSize: '16px'
            }}>📡</span>
            View Alerts
          </h3>
      
          {alerts.length > 0 ? (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {alerts.map((alert) => {
                // Find the related case if it exists
                const relatedCase = alert.caseId && cases.find(c => c._id === alert.caseId._id || c._id === alert.caseId);
                // Find the related camera if it exists
                const relatedCamera = alert.cameraId && cameras.find(cam => cam._id === alert.cameraId._id || cam._id === alert.cameraId);
                
                return (
                  <div 
                    key={alert._id} 
                    style={{ 
                      padding: '20px', 
                      marginBottom: '20px', 
                      border: '1px solid #fee2e2',
                      borderLeft: '5px solid #ef4444',
                      borderRadius: '8px',
                      backgroundColor: '#fff',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <h4 style={{ 
                      color: '#ef4444', 
                      margin: '0 0 15px 0',
                      fontSize: '18px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        backgroundColor: '#fef2f2',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>⚠️</span>
                      Potential Match Detected
                    </h4>
      
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '25px',
                      alignItems: 'flex-start'
                    }}>
                      <div style={{ flex: '1', minWidth: '280px' }}>
                        {/* <div style={{
                          marginBottom: '15px',
                          padding: '12px',
                          backgroundColor: '#fef2f2',
                          borderRadius: '8px',
                          fontWeight: '600',
                          color: '#b91c1c',
                          fontSize: '15px',
                          textAlign: 'center'
                        }}>
                          Alert Status: {alert.status || 'Pending Verification'}
                        </div> */}
                        
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'auto 1fr',
                          gap: '8px 16px',
                          fontSize: '15px'
                        }}>
                          <span style={{ fontWeight: '600', color: '#475569' }}>Message:</span>
                          <span style={{ color: '#334155' }}>{alert.message || 'N/A'}</span>
                          
                          <span style={{ fontWeight: '600', color: '#475569' }}>Camera:</span>
                          <span style={{ color: '#334155' }}>
                            {relatedCamera?.location || 
                            (typeof alert.cameraId === 'object' ? alert.cameraId?.location : 'Unknown')}
                          </span>
                          
                          <span style={{ fontWeight: '600', color: '#475569' }}>Case:</span>
                          <span style={{ color: '#334155' }}>
                            {relatedCase?.name || 
                            (typeof alert.caseId === 'object' ? alert.caseId?.name : 'Unknown')}
                          </span>
                          
                          <span style={{ fontWeight: '600', color: '#475569' }}>Station:</span>
                          <span style={{ color: '#334155' }}>{alert.policeStationNumber || 'N/A'}</span>
                          
                          <span style={{ fontWeight: '600', color: '#475569' }}>Time:</span>
                          <span style={{ color: '#334155' }}>
                            {new Date(alert.timestamp || alert.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
      
                      {(alert.image || alert.imageUrl) && (
                        <div style={{
                          minWidth: '200px',
                          maxWidth: '300px'
                        }}>
                          <div style={{
                            border: '1px solid #e2e8f0',
                            padding: '5px',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                          }}>
                            <img 
                              src={
                                alert.image ? 
                                  (typeof alert.image === 'string' && alert.image.startsWith('http') ? 
                                    alert.image : 
                                    `http://localhost:5000${typeof alert.image === 'string' ? alert.image : ''}`) : 
                                  alert.imageUrl
                              } 
                              alt="Alert Snapshot" 
                              style={{
                                width: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                aspectRatio: '16/9'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '30px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              color: '#64748b'
            }}>
              <div style={{ 
                fontSize: '36px', 
                marginBottom: '10px' 
              }}>
                🔍
              </div>
              <p style={{ 
                margin: '0', 
                fontWeight: '500' 
              }}>
                No alerts found in the system
              </p>
            </div>
          )}
        </section>
      
        {/* Stats Section */}
        <section style={{ 
          marginBottom: '30px', 
          padding: '25px', 
          border: '1px solid #e2e8f0', 
          borderRadius: '12px', 
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.03)'
        }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#334155',
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              backgroundColor: '#60a5fa',
              color: 'white',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              fontSize: '16px'
            }}>📊</span>
            System Stats
          </h3>
      
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '20px' 
          }}>
            <div style={{ 
              flex: '1', 
              minWidth: '180px',
              backgroundColor: '#eff6ff', 
              padding: '20px', 
              borderRadius: '10px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
              border: '1px solid #dbeafe'
            }}>
              <div style={{
                fontSize: '38px',
                color: '#2563eb',
                marginBottom: '10px'
              }}>
                {stats.totalCases || 0}
              </div>
              <p style={{ 
                margin: '0', 
                color: '#1e40af', 
                fontWeight: '500',
                fontSize: '15px'
              }}>
                Total Cases
              </p>
            </div>
          </div>
        </section>
      </div>
  );
};

export default Dashboard;