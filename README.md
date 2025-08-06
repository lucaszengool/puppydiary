# Pepmart Pet Portraits

Transform your pet photos into adorable Popmart-style 3D character portraits using AI!

## Features

- 🐾 **Pet Detection**: Automatically detects pets in uploaded photos
- 🎨 **Popmart Style Generation**: Creates cute, collectible-figure style portraits
- 📸 **Multiple Input Options**: Upload images or capture from webcam
- 🔐 **User Authentication**: Secure login with Clerk
- 🖼️ **Personal Gallery**: Save and manage all your generated portraits
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Production Ready**: Rate limiting, error handling, and optimizations

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4 Vision & DALL-E 3
- **Image Processing**: Sharp
- **UI Components**: Radix UI

## Setup Instructions

1. **Clone the repository**
   ```bash
   cd /Users/James/Desktop/Pepmart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env.local` file with your keys:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Deployment Options

- **Vercel**: Push to GitHub and connect to Vercel
- **Railway**: Use Railway CLI or GitHub integration
- **AWS/GCP**: Deploy using Docker or traditional Node.js hosting

## API Rate Limits

- 5 portrait generations per minute per user
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, WebP

## Future Enhancements

- [ ] Add database for persistent storage
- [ ] Implement cloud storage for images
- [ ] Add more style options
- [ ] Social sharing features
- [ ] Mobile app version

## License

MIT