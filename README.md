# TR-Tech Repairs & Designs - Frontend

A modern, responsive React frontend for TR-Tech Repairs & Designs, a technology repair and design services company.

## 🚀 Features

- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Fast Navigation**: Client-side routing with React Router
- **Contact Integration**: Direct WhatsApp messaging and contact forms
- **Professional Layout**: Clean, business-appropriate design

## 🛠️ Tech Stack

- **React 18** - Modern JavaScript library for building user interfaces
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **shadcn/ui** - High-quality React components

## 📁 Project Structure

```
tr-tech-frontend/
├── public/                 # Static assets
│   └── TR_Tech_logo.png   # Company logo
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.jsx     # Navigation bar
│   │   ├── Hero.jsx       # Main banner section
│   │   ├── Services.jsx   # Services showcase
│   │   ├── Why-Choose-Us.jsx # Company advantages
│   │   ├── CTA.jsx        # Call-to-action section
│   │   └── Footer.jsx     # Site footer
│   ├── pages/            # Page components
│   │   ├── HomePage.jsx   # Landing page
│   │   ├── AboutPage.jsx  # About us page
│   │   ├── ServicesPage.jsx # Detailed services
│   │   ├── ShopPage.jsx   # Product catalog
│   │   ├── ContactPage.jsx # Contact information
│   │   └── RepairsPage.jsx # Repair booking
│   ├── App.jsx           # Main app component with routing
│   ├── main.jsx          # App entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.cjs   # Tailwind CSS configuration
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository** (if not already done)
   ```bash
   git clone <repository-url>
   cd TR-Tech-Repairs-and-Designs/tr-tech-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## 📖 Understanding the Code

### Key Components

- **App.jsx**: Sets up routing for different pages
- **Navbar.jsx**: Fixed navigation bar with links to all sections
- **Hero.jsx**: Main banner with call-to-action buttons
- **ContactPage.jsx**: Contact form and information (includes WhatsApp integration)

### Styling

The project uses Tailwind CSS with custom design tokens defined in `tailwind.config.cjs`. Colors and spacing follow a consistent design system.

### Routing

React Router handles navigation between pages:
- `/` - Home page
- `/about` - About us
- `/services` - Services offered
- `/shop` - Product catalog
- `/book-repair` - Repair booking
- `/contact` - Contact information

## 🔧 Customization

### Colors and Branding

Edit `tailwind.config.cjs` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
      // ... other colors
    }
  }
}
```

### Adding New Pages

1. Create a new component in `src/pages/`
2. Add the route in `src/App.jsx`
3. Add navigation link in `src/components/Navbar.jsx`

### Contact Information

Update contact details in:
- `src/components/Footer.jsx` - Footer contact info
- `src/pages/ContactPage.jsx` - Contact page details

## 📱 WhatsApp Integration

The contact form and WhatsApp button use WhatsApp's web API to open conversations with pre-filled messages. The phone number is configured in the contact components.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `vite.config.js` or stop other servers
2. **Styling not updating**: Clear browser cache or restart dev server
3. **Icons not showing**: Ensure Lucide React is properly installed

### Development Tips

- Use browser dev tools to inspect elements
- Check the console for error messages
- Tailwind classes are applied at build time

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary to TR-Tech Repairs & Designs.

## 📞 Support

For technical support or questions about the codebase, contact the development team.

---

**Built with ❤️ for TR-Tech Repairs & Designs**