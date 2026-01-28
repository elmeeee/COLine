# 🚆 COLine - Commuter Line PWA

A modern, fast, and beautiful Progressive Web App for Jakarta's KRL Commuter Line train schedules.

## Features

### Core Features
- **Real-time Train Schedules** - Live departure times from all KRL stations
- **Multi-Line Display** - Shows all train lines a train passes through
- **Transit Stations** - Displays available transfer lines at each station
- **Route Visualization** - Interactive route view with color-coded segments
- **Nearby Stations** - Auto-detect and show closest stations using GPS
- **Fare Calculator** - Calculate ticket prices between stations

### UI/UX Enhancements
- **Animated Loading States** - Engaging train animations during data fetch
- **Smooth Transitions** - Native app-like experience
- **Mobile-First Design** - Optimized for narrow layouts
- **Dark Mode Support** - Easy on the eyes
- **Bottom Sheet Modals** - Familiar mobile interaction patterns

### Performance
- **Optimized API Calls** - Smart caching and retry logic
- **30s Timeout** - Reliable connection handling
- **Reduced Refetch** - Efficient data management
- **Minimal Bundle Size** - Fast initial load

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:elmeeee/COLine.git
cd COLine

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Lucide React** - Icons

## Features Showcase

### Schedule View
- View upcoming trains from any station
- See train line colors and routes
- Expandable cards with detailed route information
- Transit station indicators with available lines

### Route View
- Horizontal scrollable station cards
- Animated train icons on each card
- "+X more" indicator for long routes
- Vertical timeline with color-coded segments
- Distance and fare information

### Loading States
- Animated train moving on tracks
- Centered, engaging design
- Consistent across all views

## Configuration

The app uses the official KRL API. No additional configuration needed.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- KRL Commuter Line for the official API
- Jakarta commuters for inspiration

## Known Issues

- Some stations may have incomplete transit information
- API response times can vary

## Roadmap

- [ ] Push notifications for train delays
- [ ] Favorite stations
- [ ] Offline support
- [ ] Route planning
- [ ] Historical data

---

Made with ❤️ for Jakarta commuters
