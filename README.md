# Woman and Business - Blog Platform

A modern blog platform built with Next.js, Tailwind CSS, and Supabase for Maria Cudeiro to share insights on management, beauty, and female leadership.

## Features

- 🖋️ Blog with categorized articles
- 👑 Admin panel for content management
- 👤 User authentication and profiles
- 📢 Contact form for direct communication
- 🔗 LinkedIn integration for social media posts
- 🔒 Exclusive content for registered users
- 📊 Analytics for tracking visitor engagement

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT with Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account and project

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/woman-and-business.git
   cd woman-and-business
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   # Authentication
   JWT_SECRET=your_jwt_secret
   
   # Email Service
   SENDGRID_API_KEY=your_sendgrid_api_key
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_JWT_SECRET=your_supabase_jwt_secret
   ```

### Database Setup

There are two ways to set up the database:

#### Option 1: Using the SQL Editor in Supabase

1. Log in to your Supabase dashboard.
2. Navigate to the SQL Editor.
3. Copy the contents of `supabase-schema.sql` from the project root.
4. Paste and execute the SQL script in the Supabase SQL editor.

#### Option 2: Using the setup script

1. Make sure your environment variables are set correctly.
2. Run the setup script:
   ```bash
   npm run setup-db
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Visit [http://localhost:3000/admin/setup](http://localhost:3000/admin/setup) to verify database setup.

## Deployment

### Deploying to Vercel

1. Connect your GitHub repository to Vercel.

2. Add the environment variables in the Vercel project settings:
   - JWT_SECRET
   - SENDGRID_API_KEY
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_JWT_SECRET

3. Deploy the application using the Vercel dashboard or CLI.

4. After deployment, visit `https://your-vercel-domain.vercel.app/admin/setup` to verify the database setup.

### Database Initialization in Production

1. Once deployed, visit the `/admin/setup` route on your Vercel deployment.
2. Follow the instructions on that page to initialize the database.
3. After initialization, you should see confirmation that the admin user and categories have been created.

## Admin Login

Once the database is initialized, you can log in with the default admin credentials:

- Email: cudeiromaria@gmail.com
- Password: tuminha1321

**Note**: It's recommended to change the default password after first login.

## Project Structure

```
woman-and-business/
├── public/              # Static assets
├── scripts/             # Utility scripts for setup
├── src/
│   ├── app/             # Next.js pages and routes
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin panel pages
│   │   └── blog/        # Blog pages
│   ├── components/      # React components
│   ├── lib/             # Utility functions and services
│   └── styles/          # Global styles
├── .env                 # Environment variables
├── package.json         # Project dependencies
├── supabase-schema.sql  # Database schema
└── vercel.json          # Vercel deployment configuration
```

## License

This project is proprietary and meant for specific use by Maria Cudeiro. All rights reserved.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
