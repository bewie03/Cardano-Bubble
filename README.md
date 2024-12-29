# Cardano Bubble Map

A real-time visualization of price changes across the Cardano ecosystem, inspired by cryptobubbles.net.

## Features

- Interactive bubble visualization of Cardano tokens
- Real-time price change data from TapTools API
- Multiple timeframe views (6h, 1d, 7d, 30d, 60d, 1y)
- Responsive design with Material-UI
- Serverless architecture using Vercel

## Tech Stack

- React.js
- D3.js for visualizations
- Material-UI for components
- Vercel for hosting and serverless functions
- TapTools API for Cardano token data

## Development

1. Clone the repository:
```bash
git clone https://github.com/bewie03/Cardano-Bubble.git
cd Cardano-Bubble
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your TapTools API key:
```
TAPTOOLS_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm start
```

## Deployment

The project is set up for automatic deployment with Vercel. Just push to the main branch and Vercel will handle the rest.

## License

MIT
