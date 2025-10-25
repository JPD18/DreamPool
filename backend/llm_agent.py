import os
from typing import Dict, Any
from schemas import ProposedGoal
import json

class LLMAgent:
    def __init__(self):
        # For now, we'll use a simple fallback parser
        # TODO: Add OpenAI integration when dependencies are resolved
        pass

    async def parse_goal(self, message: str) -> ProposedGoal:
        """Parse user message and extract structured goal information"""
        try:
            # For now, use the fallback parser
            # TODO: Implement OpenAI integration
            return self._fallback_parse(message)
            
        except Exception as e:
            # Fallback parsing if LLM fails
            return self._fallback_parse(message)

    def _fallback_parse(self, message: str) -> ProposedGoal:
        """Fallback parsing when LLM fails"""
        # Simple keyword-based parsing as fallback
        message_lower = message.lower()
        
        # Extract cost
        cost_eth = 1.0  # Default
        if "expensive" in message_lower or "rare" in message_lower:
            cost_eth = 2.0
        elif "cheap" in message_lower or "budget" in message_lower:
            cost_eth = 0.5
        elif "car" in message_lower or "house" in message_lower:
            cost_eth = 10.0
            
        # Extract deadline
        deadline_days = 30  # Default
        if "week" in message_lower:
            deadline_days = 7
        elif "month" in message_lower:
            deadline_days = 30
        elif "year" in message_lower:
            deadline_days = 365
            
        return ProposedGoal(
            title=f"Goal: {message[:50]}...",
            cost_eth=cost_eth,
            deadline_days=deadline_days,
            recipient="0x0000000000000000000000000000000000000000",
            description=message
        )
