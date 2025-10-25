#!/usr/bin/env python3
"""
Simple test for the LLM agent conversation flow
"""
import asyncio
import os
from dotenv import load_dotenv
from llm_agent import LLMAgent

# Load environment variables
load_dotenv()

async def test_conversation():
    """Test the conversation flow"""
    print("🤖 Testing DreamPool LLM Agent")
    print("=" * 40)
    
    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("❌ Error: OPENAI_API_KEY not found in environment variables")
        print("Please set your OpenAI API key in the .env file")
        return
    
    # Initialize the agent
    agent = LLMAgent()
    
    # Test 1: Start a new conversation
    print("\n📝 Test 1: Starting new conversation")
    print("-" * 30)
    
    conversation = await agent.start_conversation()
    print("Agent:", conversation["messages"][0])
    
    # Test 2: Provide goal description
    print("\n👤 User: I want to buy a new laptop for my work")
    conversation = await agent.continue_conversation(conversation, "I want to buy a new laptop for my work")
    print("Agent:", conversation["messages"][-1])
    
    # Test 3: Provide amount
    print("\n👤 User: 2.5 ETH")
    conversation = await agent.continue_conversation(conversation, "2.5 ETH")
    print("Agent:", conversation["messages"][-1])
    
    # Test 4: Provide deadline
    print("\n👤 User: 30 days")
    conversation = await agent.continue_conversation(conversation, "30 days")
    print("Agent:", conversation["messages"][-1])
    
    # Test 5: Provide recipient address
    print("\n👤 User: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6")
    conversation = await agent.continue_conversation(conversation, "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6")
    print("Agent:", conversation["messages"][-1])
    
    # Test 6: Check final state
    print("\n✅ Final Conversation State:")
    print(f"Goal: {conversation.get('goal_description')}")
    print(f"Amount: {conversation.get('goal_amount_eth')} ETH")
    print(f"Deadline: {conversation.get('deadline_days')} days")
    print(f"Recipient: {conversation.get('recipient_address')}")
    print(f"Complete: {conversation.get('conversation_complete')}")
    
    print("\n🎉 Conversation flow test completed!")

if __name__ == "__main__":
    asyncio.run(test_conversation())
