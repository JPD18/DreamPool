import os
from typing import Dict, Any, Optional
from schemas import ProposedGoal
import json
from datetime import datetime, timedelta
import re
import openai

# Simple conversation state
class ConversationState:
    def __init__(self):
        self.messages = []
        self.goal_amount_eth = None
        self.deadline_days = None
        self.recipient_address = None
        self.goal_description = None
        self.conversation_complete = False

class LLMAgent:
    def __init__(self):
        # Initialize OpenAI client
        self.client = openai.OpenAI(
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
    def _parse_eth_amount(self, text: str) -> float | None:
        """Parse ETH amount from text"""
        # Look for patterns like "2.5 ETH", "1.0", "0.5 eth", etc.
        patterns = [
            r'(\d+\.?\d*)\s*eth',
            r'(\d+\.?\d*)\s*ether',
            r'^(\d+\.?\d*)$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue
        return None
    
    def _parse_deadline(self, text: str) -> int | None:
        """Parse deadline from text"""
        text_lower = text.lower()
        
        # Look for patterns like "30 days", "2 weeks", "1 month"
        day_patterns = [
            r'(\d+)\s*days?',
            r'(\d+)\s*d'
        ]
        
        week_patterns = [
            r'(\d+)\s*weeks?',
            r'(\d+)\s*w'
        ]
        
        month_patterns = [
            r'(\d+)\s*months?',
            r'(\d+)\s*m'
        ]
        
        for pattern in day_patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1))
        
        for pattern in week_patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1)) * 7
        
        for pattern in month_patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1)) * 30
        
        return None
    
    def _is_valid_ethereum_address(self, address: str) -> bool:
        """Validate Ethereum address format"""
        if not address.startswith('0x'):
            return False
        if len(address) != 42:
            return False
        try:
            int(address[2:], 16)
            return True
        except ValueError:
            return False
    
    def _eth_to_wei(self, eth_amount: float) -> int:
        """Convert ETH to Wei"""
        return int(eth_amount * 10**18)
    
    def _get_next_question(self, state: ConversationState) -> str:
        """Determine what question to ask next"""
        if not state.goal_description:
            return "What's your goal? Please describe what you want to achieve."
        elif not state.goal_amount_eth:
            return "How much ETH do you need to raise for this goal?"
        elif not state.deadline_days:
            return "When do you need the funds by? Please tell me in days (e.g., '30 days', '2 weeks', '1 month')."
        elif not state.recipient_address:
            return "Who should receive the funds? Please provide an Ethereum address (0x...)."
        else:
            return None
    
    def _generate_confirmation_message(self, state: ConversationState) -> str:
        """Generate confirmation message with all details"""
        goal = state.goal_description or "Not specified"
        amount_eth = state.goal_amount_eth or 0
        amount_wei = self._eth_to_wei(amount_eth)
        deadline_days = state.deadline_days or 0
        recipient = state.recipient_address or "Not specified"
        
        deadline_date = datetime.now() + timedelta(days=deadline_days)
        
        return f"""Perfect! Here's a summary of your pool:

🎯 **Goal**: {goal}
💰 **Amount**: {amount_eth} ETH ({amount_wei:,} Wei)
⏰ **Deadline**: {deadline_days} days ({deadline_date.strftime('%Y-%m-%d')})
👤 **Recipient**: {recipient}

Your pool is ready to be created! The smart contract will handle the fundraising and ensure funds are only released if the goal is met by the deadline."""
    
    async def start_conversation(self, initial_message: str = "") -> Dict[str, Any]:
        """Start a new conversation with the agent"""
        state = ConversationState()
        
        # Add greeting message
        greeting = """Hello! I'm your DreamPool concierge. I'll help you create a funding pool for your goal.

To get started, I need to collect some information:
1. What's your goal? (brief description)
2. How much ETH do you need to raise?
3. When do you need the funds by? (in days)
4. Who should receive the funds? (Ethereum address)

Let's start with your goal - what are you trying to achieve?"""
        
        state.messages.append(greeting)
        
        if initial_message:
            state.messages.append(initial_message)
            # Process the initial message
            await self._process_user_input(state, initial_message)
        
        return {
            "messages": state.messages,
            "goal_amount_eth": state.goal_amount_eth,
            "deadline_days": state.deadline_days,
            "recipient_address": state.recipient_address,
            "goal_description": state.goal_description,
            "conversation_complete": state.conversation_complete
        }
    
    async def continue_conversation(self, state_dict: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        """Continue an existing conversation"""
        # Reconstruct state from dict
        state = ConversationState()
        state.messages = state_dict.get("messages", [])
        state.goal_amount_eth = state_dict.get("goal_amount_eth")
        state.deadline_days = state_dict.get("deadline_days")
        state.recipient_address = state_dict.get("recipient_address")
        state.goal_description = state_dict.get("goal_description")
        state.conversation_complete = state_dict.get("conversation_complete", False)
        
        # Add user message
        state.messages.append(user_message)
        
        # Process the user input
        await self._process_user_input(state, user_message)
        
        return {
            "messages": state.messages,
            "goal_amount_eth": state.goal_amount_eth,
            "deadline_days": state.deadline_days,
            "recipient_address": state.recipient_address,
            "goal_description": state.goal_description,
            "conversation_complete": state.conversation_complete
        }
    
    async def _process_user_input(self, state: ConversationState, user_message: str):
        """Process user input and update state accordingly"""
        # Determine what information we're collecting
        if not state.goal_description:
            # Collecting goal description
            state.goal_description = user_message
            response = f"Great! So you want to: {user_message}\n\nNow, how much ETH do you need to raise for this goal?"
            state.messages.append(response)
            
        elif not state.goal_amount_eth:
            # Collecting ETH amount
            amount_eth = self._parse_eth_amount(user_message)
            if amount_eth is not None:
                state.goal_amount_eth = amount_eth
                response = f"Perfect! You need {amount_eth} ETH. That's {self._eth_to_wei(amount_eth):,} Wei.\n\nWhen do you need the funds by? Please tell me in days (e.g., '30 days', '2 weeks', '1 month')."
                state.messages.append(response)
            else:
                response = "I didn't catch the amount. Please tell me how much ETH you need (e.g., '2.5 ETH', '1.0 ETH', '0.5 ETH')."
                state.messages.append(response)
                
        elif not state.deadline_days:
            # Collecting deadline
            deadline_days = self._parse_deadline(user_message)
            if deadline_days is not None:
                state.deadline_days = deadline_days
                deadline_date = datetime.now() + timedelta(days=deadline_days)
                response = f"Got it! Deadline set for {deadline_days} days from now ({deadline_date.strftime('%Y-%m-%d')}).\n\nFinally, who should receive the funds? Please provide an Ethereum address (0x...)."
                state.messages.append(response)
            else:
                response = "I didn't understand the deadline. Please tell me in days (e.g., '30 days', '2 weeks', '1 month')."
                state.messages.append(response)
                
        elif not state.recipient_address:
            # Collecting recipient address
            recipient = user_message.strip()
            if self._is_valid_ethereum_address(recipient):
                state.recipient_address = recipient
                state.conversation_complete = True
                response = self._generate_confirmation_message(state)
                state.messages.append(response)
            else:
                response = "That doesn't look like a valid Ethereum address. Please provide a valid address starting with 0x (42 characters total)."
                state.messages.append(response)
        else:
            # Conversation is complete
            response = "The conversation is already complete. Please start a new conversation if you want to create another goal."
            state.messages.append(response)

    # Legacy method for backward compatibility
    async def parse_goal(self, message: str) -> ProposedGoal:
        """Parse user message and extract structured goal information"""
        try:
            conversation = await self.start_conversation(message)
            
            return ProposedGoal(
                title=conversation.get("goal_description", "Unknown Goal"),
                cost_eth=conversation.get("goal_amount_eth", 1.0),
                deadline_days=conversation.get("deadline_days", 30),
                recipient=conversation.get("recipient_address", "0x0000000000000000000000000000000000000000"),
                description=conversation.get("goal_description", "")
            )
            
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
