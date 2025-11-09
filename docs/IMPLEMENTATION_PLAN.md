# ParkWise MVP - Implementation Plan

## Project Overview
ParkWise is a peer-to-peer parking rental marketplace for India, allowing users to list, discover, and book parking spaces on a daily/monthly basis.

## Technology Stack
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 7.2.2
- **Styling**: Tailwind CSS 3.4.0
- **Routing**: React Router DOM 7.9.5
- **Icons**: Lucide React 0.553.0
- **Font**: Inter (Google Fonts)

## Project Structure

```
park-wise/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── MapPlaceholder.tsx
│   │   ├── ImageCarousel.tsx
│   │   ├── FilterBar.tsx
│   │   ├── TabSwitch.tsx
│   │   ├── ParkingCard.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── ViewToggle.tsx
│   │   ├── DistanceBadge.tsx
│   │   ├── AmenityIcons.tsx
│   │   ├── SortDropdown.tsx
│   │   ├── TimeSlotPicker.tsx
│   │   └── MapView.tsx
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── ParkingDetails.tsx
│   │   ├── Booking.tsx
│   │   ├── ListParking.tsx
│   │   ├── MyParking.tsx
│   │   └── AdminDashboard.tsx
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ParkingContext.tsx
│   │   └── LocationContext.tsx
│   ├── utils/              # Utility functions
│   │   ├── geolocation.ts
│   │   ├── sorting.ts
│   │   └── timeSlots.ts
│   ├── data/               # Mock data
│   │   ├── mockParkings.ts
│   │   ├── mockBookings.ts
│   │   └── mockUsers.ts
│   ├── App.tsx             # Main app with routing
│   └── main.tsx            # Entry point
├── docs/                   # Documentation
│   └── IMPLEMENTATION_PLAN.md
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── package.json
```

## User Roles

1. **Parking Owner** - Can list parking spots with details (name, location, type, price, availability, photos)
2. **Driver/User** - Can search nearby parking spots, view details, and book/pay
3. **Admin** - Can approve listings and monitor activity

## Pages/Screens Implemented

### 1. Login / Signup Page
- **Location**: `/login`, `/signup`
- **Features**:
  - Google OAuth button (UI only)
  - OTP login with phone number
  - Email/password login
  - ParkWise branding with tagline "Find. Park. Earn."
  - Navigation between login and signup

### 2. Home / Search Screen
- **Location**: `/`
- **Features**:
  - Location-based search bar with current location option
  - Map and list view toggle
  - Google Maps placeholder with parking markers
  - Nearby parking cards with:
    - Image with hover zoom effect
    - Price toggle (hourly/daily/monthly)
    - Distance badge
    - Amenities display
    - Time slots for hourly bookings
    - Verified owner badge
    - Availability status
  - Advanced Filters:
    - Type (Covered/Open)
    - Vehicle Type (2W/4W/Both)
    - Duration (Hourly/Daily/Monthly)
    - Amenities (multi-select)
  - Sorting options:
    - Distance (nearest first)
    - Price (low to high / high to low)
    - Hourly price (low to high / high to low)
    - Name (A-Z)
  - Active filters display with remove option
  - Quick stats with gradient background
  - Enhanced empty state

### 3. Parking Details Page
- **Location**: `/parking/:id`
- **Features**:
  - Image carousel
  - Owner name with verified badge
  - Description and amenities list
  - Price toggle (hourly/daily/monthly)
  - "Book Now" button
  - Parking type and vehicle compatibility

### 4. Booking Page
- **Location**: `/booking/:id`
- **Features**:
  - Date/time selection
  - Duration selector (hourly/daily/monthly)
  - Payment method selection (UPI / Razorpay placeholders)
  - Booking summary card
  - Confirmation flow

### 5. List Your Parking Page
- **Location**: `/list-parking`
- **Features**:
  - Multi-step form:
    - Basic info (name, location, address)
    - Map location picker
    - Type selection (covered/open)
    - Vehicle type (2W/4W/both)
    - Pricing (hourly/day/month)
    - Availability schedule (days of week)
    - Photo upload UI
    - Description
  - "Submit for Approval" button

### 6. My Bookings / My Listings Page
- **Location**: `/my-parking`
- **Features**:
  - Tab switch: "Bookings" / "Listings"
  - Bookings tab:
    - Cards showing status, dates, price
    - View details button
  - Listings tab:
    - Cards with edit/delete options
    - Status indicators (approved/pending/rejected)

### 7. Admin Dashboard
- **Location**: `/admin`
- **Features**:
  - Pending listings table
  - Approve/Reject action buttons
  - Analytics cards:
    - Total listings
    - Total bookings
    - Pending approvals

## Design System

### Colors
- **Primary**: `#1D4ED8` (Royal Blue)
- **Background**: Soft gray (`bg-gray-50`)
- **Text**: Dark gray (`text-gray-900`)
- **Gradients**: Primary to blue-600 for headings and accents

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 400, 500, 600, 700 (semibold, bold for emphasis)
- **Headings**: Gradient text effects for main titles
- **Hierarchy**: Clear visual hierarchy with size and weight variations

### Components
- **Buttons**: 
  - Primary, Secondary, Outline variants
  - Enhanced with shadows and hover effects
  - Active scale animation
- **Cards**: 
  - Three variants: default, elevated, outlined
  - Hover scale and shadow transitions
  - Glassmorphism effects for overlays
- **Inputs**: 
  - Labeled with error states
  - Enhanced focus states with ring effects
  - Hover border color changes
- **Modals**: Centered with backdrop
- **Badges**: Rounded with shadows and hover effects

### Visual Enhancements
- **Shadows**: Layered shadow system (sm, md, lg, xl, 2xl)
- **Transitions**: Smooth transitions (200-300ms) for all interactive elements
- **Animations**: 
  - Hover scale effects
  - Image zoom on card hover
  - Fade-in animations for filter panels
- **Glassmorphism**: Backdrop blur effects for overlays
- **Gradients**: Subtle gradient backgrounds for cards and sections
- **Micro-interactions**: Button press animations, icon hover effects

### Spacing
- Consistent spacing scale using Tailwind defaults
- Mobile-first responsive design
- Enhanced padding and margins for better visual breathing room

## Data Models

### Parking
```typescript
interface Parking {
  id: string;
  name: string;
  location: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'covered' | 'open';
  vehicleType: '2W' | '4W' | 'both';
  pricePerDay: number;
  pricePerMonth: number;
  pricePerHour?: number;
  timeSlots?: TimeSlot;
  images: string[];
  description: string;
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerVerified: boolean;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  distance?: number;
  status: 'approved' | 'pending' | 'rejected';
}

interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "18:00"
  availableHours: number[]; // [9, 10, 11, ...]
}
```

### Booking
```typescript
interface Booking {
  id: string;
  parkingId: string;
  parkingName: string;
  userId: string;
  startDate: string;
  endDate: string;
  duration: 'hourly' | 'daily' | 'monthly';
  totalAmount: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: 'upi' | 'razorpay';
  createdAt: string;
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'owner' | 'admin';
  verified: boolean;
}
```

## Routing Configuration

```typescript
Routes:
- / → Home (Search screen)
- /login → Login page
- /signup → Signup page
- /parking/:id → Parking details
- /booking/:id → Booking page
- /list-parking → List parking form
- /my-parking → My bookings/listings
- /admin → Admin dashboard
```

## Context Providers

### AuthContext
- Manages user authentication state
- Provides: `user`, `login()`, `logout()`, `isAuthenticated`

### ParkingContext
- Manages parking data and bookings
- Provides: `parkings`, `bookings`, `getParkingById()`, `getBookingsByUserId()`

### LocationContext
- Manages user's current location
- Provides: `userLocation`, `setUserLocation()`, `getUserCurrentLocation()`
- Automatically attempts to get location on mount
- Falls back to default location (Bangalore) if permission denied

## Mock Data

- **12 Parking Listings**: Various types (covered/open), locations across Bangalore, and prices
  - Includes hourly, daily, and monthly pricing options
  - Time slots for hourly bookings
  - Diverse amenities (CCTV, EV Charging, Security Guard, WiFi, etc.)
  - Mix of verified and unverified owners
- **6 Bookings**: Sample booking history with hourly, daily, and monthly durations
- **7 Users**: Sample users, owners, and admin accounts

## Key Features Implemented

✅ Responsive mobile-first design
✅ Clean, modern UI with consistent spacing
✅ Full navigation between all pages
✅ Mock authentication flow
✅ Search and filtering functionality
✅ Booking flow with payment selection
✅ Admin dashboard for listing approvals
✅ Image carousels and placeholders
✅ Form validation UI
✅ Loading and empty states
✅ Hourly parking support with time slot selection
✅ Location-based search with distance calculation
✅ Map and list view toggle
✅ Enhanced filtering (type, vehicle, duration, amenities)
✅ Sorting options (distance, price, name)
✅ Distance calculation from user location
✅ Enhanced UI with gradients, shadows, and animations
✅ Glassmorphism effects and micro-interactions
✅ Improved visual hierarchy and typography

## Utility Functions

### geolocation.ts
- `calculateDistance()`: Calculates distance between two coordinates using Haversine formula
- Returns distance in kilometers

### sorting.ts
- `sortParkings()`: Sorts parking listings by various criteria
- Sort options: distance, price-low, price-high, price-hourly-low, price-hourly-high, name
- Handles cases where user location might not be available

### timeSlots.ts
- `formatHour()`: Formats hour number to readable time (e.g., 9 → "9:00 AM")

## Future Enhancements (Not Implemented)

- Real Google Maps integration
- Actual payment gateway integration (Razorpay/UPI)
- Real authentication (Google OAuth, OTP verification)
- Image upload functionality
- Real-time availability checking
- Reviews and ratings
- Notifications
- Backend API integration
- Real-time distance updates as user moves
- Advanced map features (clustering, directions)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## UI Enhancements Completed

### Component Improvements
- **Card Component**: Added variants (default, elevated, outlined) with hover effects
- **Button Component**: Enhanced shadows, hover states, and active animations
- **Input Component**: Improved focus states, error handling, and hover effects
- **Navbar**: Added backdrop blur, user avatar, and enhanced hover states
- **ParkingCard**: 
  - Image zoom on hover
  - Glassmorphism price badge
  - Verified owner badge
  - Enhanced spacing and typography
- **FilterBar**: Improved badge styling with better spacing
- **AmenityIcons**: Card-based layout with hover effects and icon animations

### Page Enhancements
- **Home Page**:
  - Gradient heading with subtitle
  - Enhanced search bar with better styling
  - Improved filter panel with animations
  - Better empty state with icon
  - Enhanced Quick Stats with gradient background
- **ParkingDetails Page**:
  - Gradient title
  - Improved spacing and visual hierarchy
  - Enhanced pricing card with gradient background
  - Better owner information display
  - Improved amenity display with card-based layout

### Visual Polish
- Consistent shadow system throughout
- Gradient accents for headings and backgrounds
- Improved typography hierarchy
- Smooth transitions (200-300ms)
- Better color usage and contrast
- Enhanced spacing for visual breathing room
- Glassmorphism effects for overlays
- Micro-interactions for better UX

## Notes

- All backend functionality is mocked
- Authentication is simulated (no real OAuth/OTP)
- Images use placeholder URLs
- Google Maps is a placeholder component
- Payment methods are UI-only placeholders
- All data is stored in-memory (not persisted)
- Distance calculations use Haversine formula
- Location services require browser geolocation permission

