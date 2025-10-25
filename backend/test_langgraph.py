#!/usr/bin/env python3
"""
Test script for the new LangGraph ReAct agent
"""
import asyncio
import os
from dotenv import load_dotenv
from langgraph_agent import DreamPoolReActAgent

# Load environment variables
load_dotenv()

async def test_langgraph_agent():
    """Test the LangGraph ReAct agent"""
    print("🤖 Testing LangGraph ReAct Agent")
    print("=" * 50)
    
    # Initialize agent
    agent = DreamPoolReActAgent()
    
    # Test 1: Start conversation
    print("\n📝 Test 1: Starting conversation")
    print("-" * 30)
    
    initial_response = await agent.start_conversation("I want to raise money for a new laptop")
    # Get the last message (should be AI response)
    last_message = initial_response['messages'][-1] if initial_response['messages'] else None
    if isinstance(last_message, dict):
        print(f"Agent response: {last_message.get('content', 'No content')}")
    else:
        print(f"Agent response: {last_message}")
    print(f"Goal description: {initial_response.get('goal_description')}")
    print(f"Conversation complete: {initial_response.get('conversation_complete')}")
    
    # Test 2: Continue conversation with ETH amount
    print("\n💰 Test 2: Adding ETH amount")
    print("-" * 30)
    
    eth_response = await agent.continue_conversation(
        initial_response,
        "I need 2.5 ETH for the laptop"
    )
    # Get the last message (should be AI response)
    last_message = eth_response['messages'][-1] if eth_response['messages'] else None
    if isinstance(last_message, dict):
        print(f"Agent response: {last_message.get('content', 'No content')}")
    else:
        print(f"Agent response: {last_message}")
    print(f"Goal amount ETH: {eth_response.get('goal_amount_eth')}")
    print(f"Conversation complete: {eth_response.get('conversation_complete')}")
    
    # Test 3: Continue conversation with deadline
    print("\n⏰ Test 3: Adding deadline")
    print("-" * 30)
    
    deadline_response = await agent.continue_conversation(
        eth_response,
        "I need the funds in 30 days"
    )
    # Get the last message (should be AI response)
    last_message = deadline_response['messages'][-1] if deadline_response['messages'] else None
    if isinstance(last_message, dict):
        print(f"Agent response: {last_message.get('content', 'No content')}")
    else:
        print(f"Agent response: {last_message}")
    print(f"Deadline days: {deadline_response.get('deadline_days')}")
    print(f"Conversation complete: {deadline_response.get('conversation_complete')}")
    print(f"Contract payload: {deadline_response.get('contract_payload')}")
    
    # Test 4: Test parse_goal method
    print("\n🎯 Test 4: Testing parse_goal method")
    print("-" * 30)
    
    goal = await agent.parse_goal("I want to buy a car for 5 ETH and need it in 60 days")
    print(f"Parsed goal: {goal}")
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables")
        print("Please set your OpenAI API key in the .env file")
        exit(1)
    
    asyncio.run(test_langgraph_agent())
