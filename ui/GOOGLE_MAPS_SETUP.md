# Google Maps Integration Setup

This application uses Google Maps to display parking locations and allow users to select locations when listing parking spaces.

## Setup Instructions

1. **Get a Google Maps API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the following APIs:
     - **Maps JavaScript API** (required for displaying maps)
     - **Places API** (required for location search/autocomplete)
     - **Geocoding API** (required for reverse geocoding - converting coordinates to addresses)
   - Create credentials (API Key)
   - Restrict the API key to your domain (recommended for production)

2. **Add API Key to Environment Variables**
   - Create a `.env` file in the `ui` directory (if it doesn't exist)
   - Add your Google Maps API key:
     ```
     VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
     ```

3. **Restart the Development Server**
   - Stop the current dev server (if running)
   - Run `npm run dev` again to load the new environment variable

## Features

- **Interactive Maps**: Click on the map to select parking locations
- **Location Search**: Search for addresses and places using Google Places Autocomplete
- **Parking Markers**: View all parking spaces on the map with markers
- **User Location**: See your current location on the map (if permissions granted)
- **Location Selection**: Select exact coordinates when listing or editing parking spaces
- **Reverse Geocoding**: Automatically get addresses when clicking on the map

## Components

- `GoogleMap`: Base Google Maps component with marker support
- `MapPlaceholder`: Map component for location selection (used in ListParking and EditParking)
- `MapView`: Map component for viewing parking spaces (used in Home page)

## Notes

- The map will show a loading state while the Google Maps API loads
- If no API key is provided, an error message will be displayed
- The map automatically centers on user location if available, otherwise defaults to Bangalore, India

