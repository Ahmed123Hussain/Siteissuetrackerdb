<!-- Copilot custom instructions for ELV Issue Tracker project -->

## Project Overview
ELV Issue Tracker - A professional, responsive web application for managing site issues with image uploads, status tracking, and solution documentation.

## Development Status
✅ Project Setup Complete
- Vite + React + TypeScript configured
- Tailwind CSS integrated
- All components built and functional
- LocalStorage persistence implemented
- Development server running on http://localhost:3000

## Tech Stack
- Frontend: React 18 with TypeScript
- Styling: Tailwind CSS 3
- Build Tool: Vite 5
- State Management: React Hooks
- Storage: Browser LocalStorage (MVP)

## Project Structure
```
src/
├── components/
│   ├── IssueTable.tsx           - Main table with sorting/filtering
│   ├── AddIssueModal.tsx        - Form for creating new issues
│   ├── IssueDetailsModal.tsx    - Full issue details view
│   ├── StatusBadge.tsx          - Status badge component
│   └── ImagePreview.tsx         - Image thumbnail and lightbox
├── hooks/
│   └── useIssueStorage.ts       - LocalStorage persistence hook
├── types/
│   └── index.ts                 - TypeScript interfaces
├── utils/
│   └── imageHandling.ts         - Image compression & processing
├── App.tsx                      - Main application component
└── main.tsx                     - Entry point
```

## Key Features Implemented
- ✅ Dynamic issue table with sorting & filtering
- ✅ Modal-based issue creation with image uploads
- ✅ Image preview with lightbox functionality  
- ✅ Status management (Open, Work Ongoing, Closed)
- ✅ Mandatory solution description for closed issues
- ✅ Responsive design (mobile-first card layout)
- ✅ LocalStorage persistence
- ✅ Color-coded status badges
- ✅ Professional UI with smooth animations
- ✅ Search functionality
- ✅ Auto-incrementing issue numbers
- ✅ Issue statistics dashboard

## Commands
- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Development Guidelines
- Use React functional components with hooks
- Implement proper TypeScript typing
- Follow Tailwind CSS utility-first approach
- Ensure accessibility (WCAG 2.1 AA)
- Mobile-responsive design patterns
- Base64 encode images for LocalStorage
