# DreamPool MVP

A decentralized funding platform that uses AI to help users create and manage funding goals through smart contracts.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- OpenAI API key
- Openfort account and API keys

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

**Note**: This uses a minimal set of dependencies that work on Windows without Rust compilation issues.

4. Create environment file:
```bash
cp env.example .env
```

5. Update `.env` with your API keys:
```
OPENAI_API_KEY=your_openai_api_key_here
CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
```

6. Start the backend server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```
VITE_API_URL=http://localhost:8000
VITE_OPENFORT_PUBLIC_KEY=pk_test_your_key_here
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
VITE_RPC_URL=https://sepolia.infura.io/v3/your_key_here
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🏗️ Architecture

### Backend (FastAPI)
- **LLM Agent**: Parses user chat messages and extracts structured goal information
- **ABI Encoder**: Encodes smart contract function calls
- **API Endpoints**: RESTful API for frontend communication

### Frontend (React + TypeScript)
- **Chat Interface**: AI-powered goal creation
- **Wallet Integration**: Openfort wallet connection
- **Dashboard**: Goal management and tracking
- **Smart Contract**: Direct blockchain interactions

### Key Features
- 🤖 AI-powered goal parsing
- 🔗 Openfort wallet integration
- 📊 Real-time goal tracking
- 🎯 Progress visualization
- 💰 Contribution system

## 🧪 Testing the Flow

1. **Start both servers** (backend on :8000, frontend on :5173)
2. **Connect wallet** using the "Connect Wallet" button
3. **Create a goal** by chatting with the AI
4. **Confirm and create** the goal on-chain
5. **View dashboard** to see your goals

## 🔧 Development

### Backend Development
```bash
cd backend
python main.py
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
cd frontend
npm run build
```

## 📁 Project Structure

```
DreamPool/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── llm_agent.py         # LLM integration
│   ├── abi_encoder.py       # Contract interaction
│   ├── schemas.py           # Pydantic models
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API and wallet services
│   │   └── types/          # TypeScript definitions
│   └── package.json
└── README.md
```

## 🎨 Design System

- **Colors**: Dark theme with neon green (#36D421) and magenta (#E10CF1) accents
- **Typography**: Inter font family
- **Components**: Tailwind CSS with custom utilities
- **Animations**: Smooth transitions and loading states

## 🚀 Deployment

### Backend Deployment
- Deploy to any Python hosting service (Railway, Render, etc.)
- Set environment variables
- Ensure CORS is configured for your frontend domain

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Update environment variables
- Configure build settings

## 🔧 Troubleshooting

### Backend Issues

If you encounter any issues with the backend:

1. **Test the installation**:
   ```bash
   cd backend
   python test_backend.py
   ```

2. **Check dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify environment**:
   - Make sure you have a `.env` file
   - Check that the virtual environment is activated

### Common Issues

- **Port already in use**: Change the port in `main.py` or kill the process using the port
- **CORS errors**: Ensure the frontend URL is added to CORS origins in `main.py`
- **Wallet connection fails**: Check your Openfort API keys in `.env.local`

## 🔐 Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Validate all user inputs
- Implement proper error handling

## 📝 License

MIT License - see LICENSE file for details