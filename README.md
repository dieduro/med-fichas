# Med-Fichas - Medical Patient Management System

Med-Fichas is a modern web application built with Next.js for managing medical patient records and appointments. The application provides healthcare professionals with an intuitive interface to track patient information, medical history, and upcoming appointments.

## Features

- **Patient Management**: Create, view, and edit detailed patient profiles
- **Medical Records**: Maintain comprehensive medical histories for each patient
- **Appointment Tracking**: View and manage upcoming patient appointments
- **Search Functionality**: Quickly find patients by name
- **Database Integration**: Persistent storage of patient data with Supabase
- **Authentication**: User authentication and session management

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom UI components
- **UI Components**: Custom components built with Radix UI primitives
- **Database**: [Supabase](https://supabase.com/) for data storage and authentication
- **Language**: TypeScript
- **Patient Storage**: Per-account offline caches with shared authenticated Supabase records

## Project Structure

- `/src/app`: Next.js app router pages and layouts
- `/src/components`: Reusable React components
- `/src/lib/patients`: Patient persistence, pending changes and synchronization
- `/src/lib`: Shared logic
- `/src/types`: TypeScript type definitions
- `/src/lib/supabase`: Browser, server and session-refresh configuration
- `/src/actions`: Server actions for data operations

## Getting Started

First, install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, set up your environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Development

- Edit patient-related components in `/src/components/`
- Main application pages are in `/src/app/`
- Patient detail pages use dynamic routing at `/src/app/patient/[id]/`
- Screens read and write patients through `usePatients()` and the module in `/src/lib/patients`
- See [patient storage and rollout](docs/patient-storage.md) before deploying changes to an existing database
- Authentication is managed through the Supabase session proxy

## Key Components

- **Dashboard**: Main interface showing patient list and upcoming appointments
- **PatientForm**: Form for creating and editing patient information
- **PatientsList**: Displays searchable list of patients
- **NextAppointments**: Shows upcoming scheduled appointments

## Database Schema

The application uses the following Supabase tables:

- **patients**: Stores patient information including:
  - full_name
  - email
  - phone_number
  - gender
  - dob (date of birth)
  - notes (medical history)
  - age (calculated from date of birth)
