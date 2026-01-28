# 🚆 Official KRL API - Complete Documentation

## 📋 Overview

This document provides complete documentation for the **Official PT. KAI KRL API** integration.

**Base URL:** `https://api-partner.krl.co.id/krl-webs/v1`

**Authentication:** Bearer Token (JWT)

**Token Expiry:** 2026-06-06

---

## 🔑 Authentication

All requests require a Bearer token in the Authorization header:

```http
Authorization: Bearer {YOUR_TOKEN}
```

### Required Headers

```javascript
{
  'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  'Accept': 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-US,en;q=0.5',
  'Authorization': 'Bearer {TOKEN}',
  'Content-Type': 'application/json',
  'Origin': 'https://kci.id',
  'Referer': 'https://kci.id/'
}
```

---

## 📡 API Endpoints

### 1. Get All Stations

**Endpoint:** `GET /krl-station`

**Description:** Retrieve all KRL stations in the network

**Parameters:** None

**Response:**
```json
[
  {
    "sta_id": "MRI",
    "sta_name": "MANGGARAI",
    "group_wil": 1,
    "fg_enable": 1
  },
  {
    "sta_id": "JAKK",
    "sta_name": "JAKARTA KOTA",
    "group_wil": 1,
    "fg_enable": 1
  }
]
```

**Fields:**
- `sta_id` - Station ID (unique identifier)
- `sta_name` - Station name
- `group_wil` - Regional group number
- `fg_enable` - Enable flag (1 = active)

---

### 2. Get Station Schedules

**Endpoint:** `GET /schedules`

**Description:** Get train schedules for a specific station within a time range

**Query Parameters:**
- `stationid` (required) - Station ID (e.g., "PLM")
- `timefrom` (required) - Start time in HH:MM format (e.g., "15:00")
- `timeto` (required) - End time in HH:MM format (e.g., "18:00")

**Example:**
```
GET /schedules?stationid=PLM&timefrom=15:00&timeto=18:00
```

**Response:**
```json
[
  {
    "train_id": "1726B",
    "ka_name": "COMMUTER LINE BOGOR",
    "route_name": "BOGOR-JAKARTA KOTA",
    "dest": "JAKARTA KOTA",
    "time_est": "15:30:00",
    "color": "#00A651",
    "dest_time": "16:45:00"
  }
]
```

**Fields:**
- `train_id` - Train identifier
- `ka_name` - Train name/service
- `route_name` - Full route (origin-destination)
- `dest` - Destination station ID
- `time_est` - Estimated departure time
- `color` - Line color (hex code)
- `dest_time` - Arrival time at final destination

---

### 3. Get Train Route

**Endpoint:** `GET /schedules-train`

**Description:** Get complete route/stops for a specific train

**Query Parameters:**
- `trainid` (required) - Train ID (e.g., "1726B")

**Example:**
```
GET /schedules-train?trainid=1726B
```

**Response:**
```json
[
  {
    "sta_id": "BOO",
    "sta_name": "BOGOR",
    "time_est": "15:00:00"
  },
  {
    "sta_id": "BJD",
    "sta_name": "BOJONG GEDE",
    "time_est": "15:10:00"
  },
  {
    "sta_id": "CTA",
    "sta_name": "CITAYAM",
    "time_est": "15:20:00"
  }
]
```

**Fields:**
- `sta_id` - Station ID
- `sta_name` - Station name
- `time_est` - Estimated time at this station

---

### 4. Get Fare

**Endpoint:** `GET /fare`

**Description:** Calculate fare between two stations

**Query Parameters:**
- `stationfrom` (required) - Origin station ID (e.g., "PLM")
- `stationto` (required) - Destination station ID (e.g., "SDM")

**Example:**
```
GET /fare?stationfrom=PLM&stationto=SDM
```

**Response:**
```json
{
  "fare": 3000
}
```

**Fields:**
- `fare` - Fare amount in Indonesian Rupiah (IDR)

---

### 5. Get Route Map

**Endpoint:** `GET /routemap`

**Description:** Get complete route map with all lines and their stations

**Parameters:** None

**Response:**
```json
[
  {
    "route_name": "BOGOR-JAKARTA KOTA",
    "color": "#00A651",
    "stations": [
      {
        "sta_id": "BOO",
        "sta_name": "BOGOR",
        "lat": -6.5958,
        "lon": 106.7894
      },
      {
        "sta_id": "BJD",
        "sta_name": "BOJONG GEDE",
        "lat": -6.4896,
        "lon": 106.7894
      }
    ]
  }
]
```

**Fields:**
- `route_name` - Route name (origin-destination)
- `color` - Line color (hex code)
- `stations` - Array of stations on this route
  - `sta_id` - Station ID
  - `sta_name` - Station name
  - `lat` - Latitude (optional)
  - `lon` - Longitude (optional)

---

## 🎨 Line Colors

The API provides official KRL line colors:

| Route | Color | Hex Code |
|-------|-------|----------|
| Bogor Line | Green | `#00A651` |
| Rangkasbitung Line | Dark Green | `#16812B` |
| Tangerang Line | Blue | `#0099CC` |
| Bekasi Line | Red | `#DD0067` |
| Tanjung Priuk Line | Pink | `#FF69B4` |

*(Colors may vary - use the `color` field from API responses)*

---

## 💡 Usage Examples

### Example 1: Get Upcoming Trains

```typescript
// Get trains departing in the next 3 hours
const now = new Date()
const from = `${now.getHours()}:${now.getMinutes()}`
const later = new Date(now.getTime() + 3 * 60 * 60 * 1000)
const to = `${later.getHours()}:${later.getMinutes()}`

const schedules = await api.get('/schedules', {
  params: {
    stationid: 'MRI',
    timefrom: from,
    timeto: to
  }
})
```

### Example 2: Show Complete Train Journey

```typescript
// Get all stops for a specific train
const route = await api.get('/schedules-train', {
  params: {
    trainid: '1726B'
  }
})

// Display journey
route.data.forEach(stop => {
  console.log(`${stop.time_est} - ${stop.sta_name}`)
})
```

### Example 3: Calculate Trip Cost

```typescript
// Get fare from Palmerah to Sudimara
const fareResponse = await api.get('/fare', {
  params: {
    stationfrom: 'PLM',
    stationto: 'SDM'
  }
})

console.log(`Fare: Rp ${fareResponse.data.fare}`)
```

---

## 🚀 Implementation in App

### Current Implementation

The app currently uses:
- ✅ `/krl-station` - Load all stations
- ✅ `/schedules` - Show upcoming trains (3-hour window)
- ✅ `/schedules-train` - Available for train details
- ✅ `/fare` - Available for fare calculation
- ✅ `/routemap` - Available for route visualization

### Features Enabled

1. **Real-time Schedules** - Shows trains departing in next 3 hours
2. **Status Calculation** - Boarding, Departing, On Time, etc.
3. **Color-coded Lines** - Each train has its line color
4. **Route Information** - Full route name displayed

### Potential Enhancements

1. **Train Detail Modal**
   - Tap on train to see complete route
   - Show all stops with times
   - Display journey duration

2. **Fare Calculator**
   - Select origin and destination
   - Show fare instantly
   - Add to favorites

3. **Route Map Visualization**
   - Display all lines on map
   - Color-coded routes
   - Interactive station markers

4. **Journey Planner**
   - Multi-leg journeys
   - Transfer suggestions
   - Total fare calculation

---

## ⚠️ Important Notes

### Rate Limiting
- No official rate limits documented
- Use responsibly
- Cache responses when possible

### Data Freshness
- Schedules are real-time
- Updated continuously
- Time ranges limit results

### Error Handling
- Always handle network errors
- Provide fallback data
- Show user-friendly messages

### Token Management
- Token expires: 2026-06-06
- Implement token refresh
- Monitor expiration

---

## 🔧 Troubleshooting

### Common Issues

**1. CORS Errors**
- Ensure `Origin` and `Referer` headers are set
- Use proxy if needed for web apps

**2. Empty Responses**
- Check time range (timefrom/timeto)
- Verify station ID is correct
- Ensure station is active (fg_enable = 1)

**3. 401 Unauthorized**
- Token expired or invalid
- Check Authorization header
- Verify token format

**4. 404 Not Found**
- Verify endpoint URL
- Check station/train ID exists
- Ensure query parameters are correct

---

## 📊 Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process data |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Refresh token |
| 404 | Not Found | Verify IDs |
| 500 | Server Error | Retry later |

---

## 🎯 Best Practices

1. **Cache Responses**
   - Station list rarely changes
   - Route map is static
   - Cache for 24 hours

2. **Smart Time Ranges**
   - Don't request full day
   - Use 3-4 hour windows
   - Adjust based on current time

3. **Error Handling**
   - Always have fallbacks
   - Show loading states
   - Graceful degradation

4. **Performance**
   - Minimize API calls
   - Use React Query for caching
   - Debounce user inputs

---

## 📝 Summary

The Official KRL API provides:
- ✅ Real-time schedule data
- ✅ Complete station information
- ✅ Train route details
- ✅ Fare calculation
- ✅ Route map data
- ✅ Official line colors

**Status:** Fully integrated and operational! 🎉
