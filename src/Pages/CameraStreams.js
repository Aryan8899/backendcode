import { useState, useEffect, useRef } from 'react';

const DebugCameraStreams = () => {
  const [statusMessages, setStatusMessages] = useState({
    ffmpeg: 'Checking...',
    static: 'Loading...',
    simple: 'Waiting...'
  });
  
  const [selectedCamera, setSelectedCamera] = useState('1');
  const [apiUrl, setApiUrl] = useState('http://localhost:5000/api/stream');
  const [autoRefresh, setAutoRefresh] = useState(false);
  
  const staticImgRef = useRef(null);
  const simpleImgRef = useRef(null);
  
  // Check FFmpeg status on load
  useEffect(() => {
    checkFfmpegStatus();
  }, []);
  
  // Auto-refresh timer
  useEffect(() => {
    let refreshTimer;
    if (autoRefresh) {
      refreshTimer = setInterval(() => {
        refreshImages();
      }, 5000); // Refresh every 5 seconds
    }
    
    return () => {
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [autoRefresh]);
  
  // Monitor connection status for static test image
  useEffect(() => {
    if (staticImgRef.current) {
      staticImgRef.current.onload = () => 
        setStatusMessages(prev => ({ ...prev, static: 'Loaded' }));
      staticImgRef.current.onerror = () => 
        setStatusMessages(prev => ({ ...prev, static: 'Error: Failed to load' }));
    }
    
    return () => {
      if (staticImgRef.current) {
        staticImgRef.current.onload = null;
        staticImgRef.current.onerror = null;
      }
    };
  }, []);
  
  // Monitor connection status for simple test image
  useEffect(() => {
    if (simpleImgRef.current) {
      simpleImgRef.current.onload = () => 
        setStatusMessages(prev => ({ ...prev, simple: 'Loaded' }));
      simpleImgRef.current.onerror = () => 
        setStatusMessages(prev => ({ ...prev, simple: 'Error: Failed to load' }));
    }
    
    return () => {
      if (simpleImgRef.current) {
        simpleImgRef.current.onload = null;
        simpleImgRef.current.onerror = null;
      }
    };
  }, []);
  
  const checkFfmpegStatus = () => {
    setStatusMessages(prev => ({ ...prev, ffmpeg: 'Checking...' }));
    fetch(`${apiUrl}/ffmpeg-status`)
      .then(response => response.json())
      .then(data => {
        setStatusMessages(prev => ({ 
          ...prev, 
          ffmpeg: data.installed ? 'Installed' : 'Not Installed' 
        }));
      })
      .catch(error => {
        console.error('Error checking FFmpeg status:', error);
        setStatusMessages(prev => ({ 
          ...prev, 
          ffmpeg: 'Check Failed' 
        }));
      });
  };
  
  const handleCameraChange = (e) => {
    setSelectedCamera(e.target.value);
  };
  
  const refreshImages = () => {
    setStatusMessages(prev => ({ 
      ...prev, 
      static: 'Reloading...', 
      simple: 'Reloading...' 
    }));
    
    const timestamp = new Date().getTime();
    
    if (staticImgRef.current) {
      staticImgRef.current.src = `${apiUrl}/static?t=${timestamp}`;
    }
    
    if (simpleImgRef.current) {
      simpleImgRef.current.src = `${apiUrl}/ffmpeg-test?t=${timestamp}`;
    }
  };
  
  const updateApiUrl = (e) => {
    setApiUrl(e.target.value);
  };
  
  const checkServerStatus = () => {
    fetch(`${apiUrl}/test`)
      .then(response => {
        if (response.ok) {
          return response.text();
        }
        throw new Error('Server not responding');
      })
      .then(data => {
        alert(`Server is online: ${data}`);
      })
      .catch(error => {
        alert(`Could not connect to server: ${error.message}. Make sure your server is running at ${apiUrl}`);
      });
  };
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Camera Streaming Debugger</h1>
      
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <p className="font-bold">Troubleshooting Assistant</p>
        <p>This page helps diagnose issues with your camera streaming setup.</p>
      </div>
      
      <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4 flex justify-between items-center">
        <div>
          <p className="font-bold">FFmpeg Status: 
            <span className={`ml-2 ${statusMessages.ffmpeg === 'Installed' ? 'text-green-600' : 'text-red-600'}`}>
              {statusMessages.ffmpeg}
            </span>
          </p>
        </div>
        <div>
          <button 
            onClick={checkFfmpegStatus} 
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Recheck FFmpeg
          </button>
        </div>
      </div>
      
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="api-url" className="block font-medium mb-1">API URL:</label>
          <input 
            type="text" 
            id="api-url" 
            value={apiUrl} 
            onChange={updateApiUrl} 
            className="border rounded p-2 w-full"
          />
        </div>
        
        <div className="flex items-end">
          <div className="mr-4">
            <label htmlFor="camera-select" className="block font-medium mb-1">Camera:</label>
            <select 
              id="camera-select" 
              value={selectedCamera} 
              onChange={handleCameraChange}
              className="border rounded p-2"
            >
              <option value="1">Camera 1</option>
              <option value="2">Camera 2</option>
              <option value="3">Camera 3</option>
            </select>
          </div>
          
          <button 
            onClick={checkServerStatus} 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Check Server Status
          </button>
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <input 
          type="checkbox" 
          id="auto-refresh" 
          checked={autoRefresh} 
          onChange={() => setAutoRefresh(!autoRefresh)}
          className="mr-2"
        />
        <label htmlFor="auto-refresh">Auto-refresh images every 5 seconds</label>
        
        <button 
          onClick={refreshImages}
          className="ml-auto bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Refresh Images Now
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Static SVG Test */}
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Test 1: Static SVG Test</h2>
          <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
            <img 
              ref={staticImgRef}
              src={`${apiUrl}/static`}
              alt="Static Test" 
              className="max-w-full max-h-full"
            />
          </div>
          <div className={`mt-2 ${statusMessages.static.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            Status: {statusMessages.static}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            This is a simple SVG test that doesn't use FFmpeg. If this works but other tests fail, 
            your server is running but there may be FFmpeg issues.
          </div>
        </div>
        
        {/* Simple FFmpeg Test */}
        <div className="border rounded p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Test 2: Simple FFmpeg Test</h2>
          <div className="bg-black aspect-video flex items-center justify-center overflow-hidden">
            <img 
              ref={simpleImgRef}
              src={`${apiUrl}/ffmpeg-test`}
              alt="Simple FFmpeg Test"
              className="max-w-full max-h-full"
            />
          </div>
          <div className={`mt-2 ${statusMessages.simple.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            Status: {statusMessages.simple}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            This uses FFmpeg with basic settings. If this works but the MJPEG stream doesn't, 
            the issue is likely with the MJPEG stream configuration.
          </div>
        </div>
      </div>
      
      {/* Direct MJPEG stream link for testing */}
      <div className="mt-6 border rounded p-4 bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">MJPEG Stream Test</h2>
        <p className="mb-2">
          If the above tests work, try the MJPEG stream directly by clicking the link below:
        </p>
        <a 
          href={`${apiUrl}/mjpeg/${selectedCamera}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Open MJPEG stream for Camera {selectedCamera} in new tab
        </a>
        <p className="mt-2 text-sm text-gray-600">
          Note: You should see an image that updates continuously. If not, check your server logs for errors.
        </p>
      </div>
      
      <div className="mt-6 border rounded p-4 bg-red-50">
        <h2 className="text-xl font-semibold mb-2">Common Issues & Solutions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">FFmpeg Not Installed:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Windows: Download and install from ffmpeg.org</li>
              <li>Ubuntu/Debian: <code className="bg-gray-200 px-1">apt install ffmpeg</code></li>
              <li>Mac: <code className="bg-gray-200 px-1">brew install ffmpeg</code></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">File Permission Issues:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Make sure the Node.js process has write access to the frames directory</li>
              <li>Try running the server with administrator privileges</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">CORS Issues:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Make sure CORS is properly configured in your Express app</li>
              <li>The API endpoint should have proper CORS headers</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold">Path Issues:</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Make sure FFmpeg is in your system PATH</li>
              <li>Try using absolute paths for input/output files</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugCameraStreams;