#!/usr/bin/env python3
"""
Test script to verify the cleaned up backend works
"""

try:
    # Test imports
    from main import app
    from schemas import ProposedGoal, EncodedTx
    from llm_agent import LLMAgent
    from abi_encoder import ABIEncoder
    
    print("✅ All backend modules imported successfully!")
    
    # Test basic functionality
    agent = LLMAgent()
    encoder = ABIEncoder()
    
    print("✅ Services initialized successfully!")
    print("🚀 Backend is ready! Run: python main.py")
    print("📡 API will be available at: http://localhost:8000")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Please install requirements: pip install -r requirements.txt")
except Exception as e:
    print(f"❌ Error: {e}")
