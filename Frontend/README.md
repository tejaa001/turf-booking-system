# TurfBook Frontend

A modern, responsive frontend application for the TurfBook system - a comprehensive turf booking platform.

## Features

- **User Authentication**: Secure login/register for both users and admins
- **Turf Browsing**: Search and filter sports facilities with real-time availability
- **Booking Management**: Complete booking flow with payment integration
- **User Dashboard**: Profile management and booking history
- **Admin Dashboard**: Turf management, bookings overview, and revenue analytics
- **Responsive Design**: Optimized for all devices and screen sizes

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **Vite** for development and building

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd turfbook-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your API URL and Razorpay key.

4. **Start development server**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── components/
│   ├── Common/          # Reusable components
│   └── Layout/          # Layout components
├── context/             # React context providers
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── user/           # User dashboard pages
│   └── admin/          # Admin dashboard pages
├── services/           # API service functions
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## API Integration

The application integrates with the TurfBook API providing:

- User authentication and profile management
- Turf listing, search, and details
- Booking creation and management
- Payment processing with Razorpay
- Admin operations for turf and booking management
- Review and rating system

## Key Features

### For Users
- Browse and search available turfs
- View detailed turf information with images
- Check real-time availability
- Book turfs with secure payment
- Manage bookings and profile
- Submit reviews and ratings

### For Admins
- Manage turf listings with image uploads
- View and manage bookings
- Track revenue and analytics
- Monitor user reviews and ratings
- Toggle turf availability status

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Consistent component structure
- Responsive design patterns
- Modern React hooks and patterns

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform

## Environment Variables

- `VITE_API_URL` - Backend API URL
- `VITE_RAZORPAY_KEY_ID` - Razorpay public key for payments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.