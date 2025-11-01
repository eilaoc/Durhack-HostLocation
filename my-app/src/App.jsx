import React, { useState, useMemo } from 'react';
import { MapPin, Users, Calendar, Clock, Plane, TrendingDown, Award, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const MeetingOptimizer = () => {
  const [offices, setOffices] = useState([
    { id: 1, name: 'London', lat: 51.5074, lng: -0.1278, attendees: 0, airport: 'LHR' },
    { id: 2, name: 'Budapest', lat: 47.4979, lng: 19.0402, attendees: 0, airport: 'BUD' },
    { id: 3, name: 'Wroclaw', lat: 51.1079, lng: 17.0385, attendees: 0, airport: 'WRO' },
    { id: 4, name: 'Sydney', lat: -33.8688, lng: 151.2093, attendees: 0, airport: 'SYD' },
    { id: 5, name: 'Aarhus', lat: 56.1629, lng: 10.2039, attendees: 0, airport: 'AAR' },
    { id: 6, name: 'Geneva', lat: 46.2044, lng: 6.1432, attendees: 0, airport: 'GVA' },
    { id: 7, name: 'Zurich', lat: 47.3769, lng: 8.5417, attendees: 0, airport: 'ZRH' },
    { id: 8, name: 'Shanghai', lat: 31.2304, lng: 121.4737, attendees: 0, airport: 'PVG' },
    { id: 9, name: 'Dubai', lat: 25.2048, lng: 55.2708, attendees: 0, airport: 'DXB' },
    { id: 10, name: 'Mumbai', lat: 19.0760, lng: 72.8777, attendees: 0, airport: 'BOM' },
    { id: 11, name: 'Singapore', lat: 1.3521, lng: 103.8198, attendees: 0, airport: 'SIN' },
    { id: 12, name: 'Hong Kong', lat: 22.3193, lng: 114.1694, attendees: 0, airport: 'HKG' },
    { id: 13, name: 'Paris', lat: 48.8566, lng: 2.3522, attendees: 0, airport: 'CDG' },
  ]);

  const [meetingDates, setMeetingDates] = useState({
    startDate: '',
    endDate: '',
    flexibility: 3 // days of flexibility
  });

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFlightDetails, setShowFlightDetails] = useState({});
  const [analysisMode, setAnalysisMode] = useState('balanced'); // 'carbon', 'distance', 'balanced'

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Estimate CO2 emissions based on distance (kg CO2)
  const estimateCO2 = (distance) => {
    // Average emissions: ~90g CO2 per passenger-km for short-haul, ~80g for long-haul
    const emissionFactor = distance < 1500 ? 0.09 : 0.08;
    return distance * emissionFactor;
  };

  // Estimate flight time (hours)
  const estimateFlightTime = (distance) => {
    const avgSpeed = 800; // km/h average cruising speed
    const taxiTime = 0.5; // hours for takeoff/landing
    return (distance / avgSpeed) + taxiTime;
  };

  // Generate mock flight options
  const generateFlightOptions = (origin, destination, date) => {
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const baseTime = estimateFlightTime(distance);
    const baseCO2 = estimateCO2(distance);
    
    const flights = [];
    const numFlights = distance < 1000 ? 8 : distance < 3000 ? 5 : 3;
    
    for (let i = 0; i < numFlights; i++) {
      const departureHour = 6 + (i * (18 / numFlights));
      const stops = distance > 8000 && Math.random() > 0.6 ? 1 : 0;
      const duration = baseTime * (stops ? 1.4 : 1) + (Math.random() * 0.5 - 0.25);
      const price = (distance * 0.15) + (stops ? 50 : 150) + (Math.random() * 200);
      
      flights.push({
        id: `${origin.airport}-${destination.airport}-${i}`,
        departure: `${Math.floor(departureHour).toString().padStart(2, '0')}:${((departureHour % 1) * 60).toFixed(0).padStart(2, '0')}`,
        arrival: `${((departureHour + duration) % 24).toFixed(0).padStart(2, '0')}:${(((departureHour + duration) % 1) * 60).toFixed(0).padStart(2, '0')}`,
        duration: duration.toFixed(1),
        stops,
        co2: baseCO2 * (stops ? 1.2 : 1),
        price: Math.round(price),
        airline: ['British Airways', 'Emirates', 'Singapore Airlines', 'United', 'Lufthansa'][Math.floor(Math.random() * 5)]
      });
    }
    
    return flights.sort((a, b) => parseFloat(a.duration) - parseFloat(b.duration));
  };

  // Additional potential meeting locations based on OAG Megahubs 2024 connectivity data
  // Source: Global airport connectivity rankings considering international connections
  const potentialLocations = [
    // Top European hubs - highly connected
    { id: 101, name: 'Amsterdam', lat: 52.3676, lng: 4.9041, airport: 'AMS', type: 'potential', connectivity: 'very-high', reason: 'Top 10 globally connected hub' },
    { id: 102, name: 'Frankfurt', lat: 50.1109, lng: 8.6821, airport: 'FRA', type: 'potential', connectivity: 'very-high', reason: 'Top 10 globally connected, 300+ destinations' },
    { id: 103, name: 'Istanbul', lat: 41.0082, lng: 28.9784, airport: 'IST', type: 'potential', connectivity: 'very-high', reason: '#1 most destinations (309), Europe-Asia bridge' },
    { id: 104, name: 'Copenhagen', lat: 55.6761, lng: 12.5683, airport: 'CPH', type: 'potential', connectivity: 'high', reason: 'Scandinavian hub, near Aarhus office' },
    { id: 105, name: 'Vienna', lat: 48.2082, lng: 16.3738, airport: 'VIE', type: 'potential', connectivity: 'high', reason: 'Central Europe hub, near Budapest/Wroclaw' },
    { id: 106, name: 'Munich', lat: 48.1351, lng: 11.5820, airport: 'MUC', type: 'potential', connectivity: 'high', reason: 'Major European hub' },
    { id: 107, name: 'Prague', lat: 50.0755, lng: 14.4378, airport: 'PRG', type: 'potential', connectivity: 'medium', reason: 'Central location for European offices' },
    { id: 108, name: 'Brussels', lat: 50.8503, lng: 4.3517, airport: 'BRU', type: 'potential', connectivity: 'high', reason: 'EU capital, central European location' },
    { id: 109, name: 'Barcelona', lat: 41.3874, lng: 2.1686, airport: 'BCN', type: 'potential', connectivity: 'high', reason: 'Southern European hub' },
    { id: 110, name: 'Milan', lat: 45.4642, lng: 9.1900, airport: 'MXP', type: 'potential', connectivity: 'medium', reason: 'Northern Italy hub' },
    
    // Middle East super-connectors
    { id: 111, name: 'Doha', lat: 25.2854, lng: 51.5310, airport: 'DOH', type: 'potential', connectivity: 'very-high', reason: 'Qatar Airways hub, Europe-Asia connector' },
    { id: 112, name: 'Abu Dhabi', lat: 24.4539, lng: 54.3773, airport: 'AUH', type: 'potential', connectivity: 'high', reason: 'Near Dubai, Etihad hub' },
    
    // Asia-Pacific major hubs
    { id: 113, name: 'Bangkok', lat: 13.7563, lng: 100.5018, airport: 'BKK', type: 'potential', connectivity: 'very-high', reason: 'Top 20 globally connected, Southeast Asia hub' },
    { id: 114, name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, airport: 'KUL', type: 'potential', connectivity: 'very-high', reason: '#2 globally connected airport' },
    { id: 115, name: 'Tokyo Haneda', lat: 35.5494, lng: 139.7798, airport: 'HND', type: 'potential', connectivity: 'very-high', reason: '#3 globally connected airport' },
    { id: 116, name: 'Seoul Incheon', lat: 37.4602, lng: 126.4407, airport: 'ICN', type: 'potential', connectivity: 'very-high', reason: 'Top 5 globally connected, tech hub' },
    { id: 117, name: 'Delhi', lat: 28.5562, lng: 77.1000, airport: 'DEL', type: 'potential', connectivity: 'high', reason: 'Major South Asian hub' },
    { id: 118, name: 'Taipei', lat: 25.0330, lng: 121.5654, airport: 'TPE', type: 'potential', connectivity: 'medium', reason: 'East Asian connector' },
  ];

  // Calculate optimal locations
  const analysisResults = useMemo(() => {
    const activeOffices = offices.filter(o => o.attendees > 0);
    if (activeOffices.length === 0) return [];

    const totalAttendees = activeOffices.reduce((sum, o) => sum + o.attendees, 0);

    // Combine QRT offices and potential meeting locations
    const allLocations = [...offices.map(o => ({...o, type: 'office'})), ...potentialLocations];

    const results = allLocations.map(destination => {
      let totalCO2 = 0;
      let totalDistance = 0;
      let maxDistance = 0;
      let totalTravelTime = 0;
      
      const routes = activeOffices.map(origin => {
        if (origin.id === destination.id) {
          return {
            origin: origin.name,
            distance: 0,
            co2: 0,
            travelTime: 0,
            attendees: origin.attendees
          };
        }
        
        const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
        const co2 = estimateCO2(distance);
        const travelTime = estimateFlightTime(distance);
        
        totalCO2 += co2 * origin.attendees;
        totalDistance += distance * origin.attendees;
        maxDistance = Math.max(maxDistance, distance);
        totalTravelTime += travelTime * origin.attendees;
        
        return {
          origin: origin.name,
          originData: origin,
          distance: distance.toFixed(0),
          co2: co2.toFixed(0),
          travelTime: travelTime.toFixed(1),
          attendees: origin.attendees
        };
      });

      const avgDistance = totalDistance / totalAttendees;
      const avgCO2 = totalCO2 / totalAttendees;
      const avgTravelTime = totalTravelTime / totalAttendees;
      
      // Calculate fairness score (lower is better) - standard deviation of distances
      const distanceVariance = routes.reduce((sum, r) => {
        const dist = parseFloat(r.distance);
        return sum + Math.pow(dist - avgDistance, 2);
      }, 0) / routes.length;
      const fairnessScore = Math.sqrt(distanceVariance);

      // Calculate composite score based on mode
      let score;
      if (analysisMode === 'carbon') {
        score = totalCO2;
      } else if (analysisMode === 'distance') {
        score = fairnessScore;
      } else {
        // Balanced: normalize and combine metrics
        score = (totalCO2 / 1000) + (fairnessScore / 100);
      }

      return {
        location: destination,
        totalCO2: totalCO2.toFixed(0),
        avgCO2: avgCO2.toFixed(0),
        totalDistance: totalDistance.toFixed(0),
        avgDistance: avgDistance.toFixed(0),
        maxDistance: maxDistance.toFixed(0),
        avgTravelTime: avgTravelTime.toFixed(1),
        fairnessScore: fairnessScore.toFixed(0),
        score,
        routes: routes.filter(r => r.distance > 0)
      };
    });

    return results.sort((a, b) => a.score - b.score);
  }, [offices, analysisMode]);

  const updateAttendees = (id, value) => {
    setOffices(offices.map(o => 
      o.id === id ? { ...o, attendees: Math.max(0, parseInt(value) || 0) } : o
    ));
  };

  const totalAttendees = offices.reduce((sum, o) => sum + o.attendees, 0);

  const toggleFlightDetails = (locationId) => {
    setShowFlightDetails(prev => ({
      ...prev,
      [locationId]: !prev[locationId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-800">Global Meeting Location Optimizer</h1>
          </div>
          <p className="text-slate-600 mb-3">Find the optimal meeting location balancing carbon emissions, travel fairness, and flight schedules</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <span className="font-semibold text-blue-900">Data Source:</span> 
            <span className="text-blue-700"> Analysis includes locations from OAG Megahubs 2024 report - the world's most connected airports based on international flight connectivity</span>
          </div>
        </div>

        {/* Meeting Dates */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-800">Meeting Dates</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
              <input
                type="date"
                value={meetingDates.startDate}
                onChange={(e) => setMeetingDates({...meetingDates, startDate: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
              <input
                type="date"
                value={meetingDates.endDate}
                onChange={(e) => setMeetingDates({...meetingDates, endDate: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Flexibility (days)</label>
              <input
                type="number"
                value={meetingDates.flexibility}
                onChange={(e) => setMeetingDates({...meetingDates, flexibility: parseInt(e.target.value) || 0})}
                min="0"
                max="14"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Office Attendees Configuration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-slate-800">Office Attendees</h2>
            </div>
            <div className="text-sm text-slate-600">Total: <span className="font-bold text-blue-600">{totalAttendees}</span> attendees</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {offices.map(office => (
              <div key={office.id} className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">{office.name} ({office.airport})</label>
                <input
                  type="number"
                  value={office.attendees}
                  onChange={(e) => updateAttendees(office.id, e.target.value)}
                  min="0"
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Mode Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Optimization Priority</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setAnalysisMode('carbon')}
              className={`p-4 rounded-lg border-2 transition-all ${
                analysisMode === 'carbon' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-slate-200 hover:border-green-300'
              }`}
            >
              <TrendingDown className={`w-6 h-6 mb-2 ${analysisMode === 'carbon' ? 'text-green-600' : 'text-slate-400'}`} />
              <div className="font-bold text-slate-800">Minimize Carbon</div>
              <div className="text-sm text-slate-600">Prioritize lowest emissions</div>
            </button>
            <button
              onClick={() => setAnalysisMode('distance')}
              className={`p-4 rounded-lg border-2 transition-all ${
                analysisMode === 'distance' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <Award className={`w-6 h-6 mb-2 ${analysisMode === 'distance' ? 'text-blue-600' : 'text-slate-400'}`} />
              <div className="font-bold text-slate-800">Maximize Fairness</div>
              <div className="text-sm text-slate-600">Equal travel distances</div>
            </button>
            <button
              onClick={() => setAnalysisMode('balanced')}
              className={`p-4 rounded-lg border-2 transition-all ${
                analysisMode === 'balanced' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-slate-200 hover:border-purple-300'
              }`}
            >
              <MapPin className={`w-6 h-6 mb-2 ${analysisMode === 'balanced' ? 'text-purple-600' : 'text-slate-400'}`} />
              <div className="font-bold text-slate-800">Balanced</div>
              <div className="text-sm text-slate-600">Optimize both factors</div>
            </button>
          </div>
        </div>

        {/* Results */}
        {totalAttendees > 0 && analysisResults.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Recommended Locations</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1 text-sm text-slate-600">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Rankings based on {analysisMode === 'carbon' ? 'carbon emissions' : analysisMode === 'distance' ? 'travel fairness' : 'balanced optimization'}
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-200 rounded"></div>
                    <span className="text-slate-600">QRT Office</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span className="text-slate-600">Other Location</span>
                  </div>
                </div>
              </div>
            </div>

            {analysisResults.slice(0, 10).map((result, index) => (
              <div key={result.location.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-slate-100 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {result.location.name}
                        {result.location.type === 'potential' && (
                          <span className="ml-3 text-sm font-normal text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                            {result.location.connectivity === 'very-high' ? '⭐ ' : ''}Non-Office Location
                          </span>
                        )}
                      </h3>
                      <p className="text-slate-600">
                        Airport: {result.location.airport}
                        {result.location.reason && (
                          <span className="ml-2 text-sm text-blue-600">• {result.location.reason}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Best Match
                    </div>
                  )}
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-sm text-green-700 font-medium mb-1">Total CO₂</div>
                    <div className="text-2xl font-bold text-green-900">{result.totalCO2} kg</div>
                    <div className="text-xs text-green-600">Avg: {result.avgCO2} kg/person</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-sm text-blue-700 font-medium mb-1">Avg Distance</div>
                    <div className="text-2xl font-bold text-blue-900">{result.avgDistance} km</div>
                    <div className="text-xs text-blue-600">Max: {result.maxDistance} km</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm text-purple-700 font-medium mb-1">Avg Travel Time</div>
                    <div className="text-2xl font-bold text-purple-900">{result.avgTravelTime} hrs</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-sm text-orange-700 font-medium mb-1">Fairness Score</div>
                    <div className="text-2xl font-bold text-orange-900">{result.fairnessScore}</div>
                    <div className="text-xs text-orange-600">Lower is better</div>
                  </div>
                </div>

                {/* Flight Details Toggle */}
                <button
                  onClick={() => toggleFlightDetails(result.location.id)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-slate-800">View Flight Options</span>
                  </div>
                  {showFlightDetails[result.location.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                {/* Flight Details */}
                {showFlightDetails[result.location.id] && (
                  <div className="space-y-4 mt-4">
                    {result.routes.map((route, idx) => {
                      const flights = meetingDates.startDate 
                        ? generateFlightOptions(route.originData, result.location, meetingDates.startDate)
                        : [];
                      
                      return (
                        <div key={idx} className="border border-slate-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-slate-800">{route.origin} → {result.location.name}</div>
                              <div className="text-sm text-slate-600">({route.attendees} attendees)</div>
                            </div>
                            <div className="text-sm text-slate-600">{route.distance} km • {route.travelTime} hrs</div>
                          </div>

                          {meetingDates.startDate ? (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-slate-700 mb-2">Available Flights on {meetingDates.startDate}:</div>
                              {flights.slice(0, 3).map(flight => (
                                <div key={flight.id} className="flex items-center justify-between bg-slate-50 rounded p-3">
                                  <div className="flex items-center gap-4">
                                    <div>
                                      <div className="font-medium text-slate-800">{flight.airline}</div>
                                      <div className="text-sm text-slate-600">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop`}</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium">{flight.departure}</span>
                                      <Plane className="w-4 h-4 text-slate-400" />
                                      <span className="font-medium">{flight.arrival}</span>
                                      <span className="text-slate-600">({flight.duration}h)</span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-slate-800">${flight.price}</div>
                                    <div className="text-xs text-green-600">{Math.round(flight.co2)} kg CO₂</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-500 italic">Set meeting dates to view flight options</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {totalAttendees === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Attendees Configured</h3>
            <p className="text-slate-600">Add attendee numbers for each office to see location recommendations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingOptimizer;