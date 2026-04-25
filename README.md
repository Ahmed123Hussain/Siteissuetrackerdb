# ELV Issue Tracker

A modern, professional web application for ELV supervisors to log, track, and manage site issues efficiently. Built with React, TypeScript, and Tailwind CSS.

## Features

### Core Features
- **Dynamic Issue Table** - Modern, responsive table with sorting, filtering, and search
- **Add New Issues** - Modal form with location, description, and image uploads
- **Image Management** - Upload shop drawings and site photos with thumbnail previews
- **Status Management** - Track issues through Open → Work Ongoing → Closed workflow
- **Solution Tracking** - Mandatory solution documentation when closing issues
- **Responsive Design** - Fully mobile-optimized with card layout on small screens
- **Data Persistence** - Browser LocalStorage for automatic data persistence
- **Image Preview** - Lightbox modal for viewing full-size images

### Advanced Features
- Real-time search and filtering
- Color-coded status badges
- Issue statistics dashboard
- Sortable columns (desktop)
- Smooth animations and transitions
- Professional UI with soft shadows and rounded corners

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS 3
- **Build Tool**: Vite 5
- **Storage**: Browser LocalStorage (MVP)
- **State Management**: React Hooks

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Output files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/           # React components
│   ├── IssueTable.tsx
│   ├── AddIssueModal.tsx
│   ├── IssueDetailsModal.tsx
│   ├── StatusBadge.tsx
│   └── ImagePreview.tsx
├── hooks/               # Custom React hooks
│   └── useIssueStorage.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── imageHandling.ts
├── App.tsx              # Main App component
├── App.css              # App styles
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Data Structure

### Issue Object
```typescript
{
  id: string;                    // UUID
  issueNumber: number;           // Auto-incremented
  location: string;              // Issue location (required)
  description: string;           // Issue description (required)
  shopDrawing: {                 // Shop drawing image (required)
    data: string;                // Base64 encoded image
    filename: string;
    thumbnail: string;           // Base64 thumbnail
  };
  siteImage?: {                  // Site photo (optional)
    data: string;
    filename: string;
    thumbnail: string;
  };
  status: 'Open' | 'Work Ongoing' | 'Closed';
  solution?: string;             // Solution description (for closed issues)
  createdAt: string;             // ISO timestamp
  closedAt?: string;             // ISO timestamp (when closed)
  updatedAt: string;             // ISO timestamp
}
```

## Usage Guide

### Adding an Issue
1. Click the **"+ Add Issue"** button in the header
2. Fill in the required fields (Location, Description, Shop Drawing)
3. Optionally upload a Site Image
4. Click **"Add Issue"** to save

### Viewing Issue Details
- Click the **Details** button on any issue row
- View full images, solution details, and timestamps

### Changing Issue Status

**Desktop**: Use the status dropdown in the table
**Mobile**: Use the status dropdown in the card

**Status Flow**:
- **Open** → Default state for new issues
- **Work Ongoing** → Issue is being addressed
- **Closed** → Issue resolved (requires solution description)

### Managing Issues
- **Edit**: Change status or add solution
- **Delete**: Remove issue from tracker
- **Search**: Find by location or description
- **Filter**: Show only specific statuses

## Styling

The application uses a modern design system with:
- Soft shadows (`shadow-soft`, `shadow-soft-md`)
- Rounded corners (8px, 12px, 16px)
- Color-coded status badges
- Smooth transitions and hover effects
- Professional gradient accents

### Status Colors
- **Open**: Red (#ef4444)
- **Work Ongoing**: Orange (#f97316)
- **Closed**: Green (#22c55e)

## LocalStorage

All issues are automatically saved to browser LocalStorage under the key `elv_issues`. Clear browser data to reset the application state.

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] PDF export functionality
- [ ] User authentication
- [ ] Backend database integration
- [ ] Multi-user collaboration
- [ ] Issue assignment and notifications
- [ ] Advanced filtering and reporting
- [ ] Drag-and-drop file upload
- [ ] Image annotation tools
- [ ] Mobile app (React Native)
- [ ] Real-time synchronization

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Performance Optimizations

- Image compression on upload (80% JPEG quality)
- Efficient thumbnail generation (150x150px)
- Base64 encoding for data persistence
- React.memo for modal components
- Lazy state updates

## Accessibility

- Semantic HTML
- ARIA labels where applicable
- Keyboard navigation support
- High contrast colors for status badges
- Mobile-friendly touch targets

## License

Private - ELV Supervisor Tool

## Support

For issues or feature requests, contact the development team.
