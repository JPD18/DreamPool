from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

from schemas import ChatInput, ProposedGoal, EncodedTx
from llm_agent import LLMAgent
from abi_encoder import ABIEncoder

# Load environment variables
load_dotenv()

app = FastAPI(title="DreamPool API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_agent = LLMAgent()
abi_encoder = ABIEncoder()

@app.get("/")
async def root():
    return {"message": "DreamPool API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/llm/propose")
async def propose_goal(chat_data: dict):
    """Parse user chat message and extract structured goal information"""
    try:
        message = chat_data.get("message", "")
        goal = await llm_agent.parse_goal(message)
        return {
            "title": goal.title,
            "cost_eth": goal.cost_eth,
            "deadline_days": goal.deadline_days,
            "recipient": goal.recipient,
            "description": goal.description
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse goal: {str(e)}")

@app.post("/llm/build_tx")
async def build_transaction(goal_data: dict):
    """Build transaction data for creating a pool"""
    try:
        goal = ProposedGoal(
            title=goal_data.get("title", ""),
            cost_eth=goal_data.get("cost_eth", 0),
            deadline_days=goal_data.get("deadline_days", 30),
            recipient=goal_data.get("recipient", ""),
            description=goal_data.get("description", "")
        )
        tx_data = await abi_encoder.encode_create_pool(goal)
        return {
            "to": tx_data.to,
            "data": tx_data.data,
            "value": tx_data.value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build transaction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
