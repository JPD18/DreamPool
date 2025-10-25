# DreamPool LLM Agent

This document explains the LangGraph-based LLM agent that helps users create funding pools through natural conversation.

## Overview

The LLM agent uses LangGraph to create a structured conversation flow that collects:
1. **Goal Description** - What the user wants to achieve
2. **Amount in ETH** - How much ETH they need to raise
3. **Deadline** - When they need the funds by (in days)

## Architecture

This implementation uses LangGraph with OpenAI's GPT-4o-mini to provide a robust, tool-enabled conversation system. The agent automatically extracts structured data from natural language using specialized tools and maintains conversation state throughout the interaction.

## Features

- **Natural Language Processing**: Users can describe their goals in natural language
- **ETH to Wei Conversion**: Automatically converts ETH amounts to Wei for smart contract compatibility
- **Flexible Deadline Parsing**: Accepts various formats (days, weeks, months)
- **Address Validation**: Validates Ethereum addresses before proceeding
- **Conversation State Management**: Maintains conversation context throughout the flow
- **Error Handling**: Gracefully handles invalid inputs and provides helpful feedback

## API Endpoints

### Start New Conversation
```http
POST /llm/chat/start
Content-Type: application/json

{
  "message": "I want to buy a new laptop"
}
```

### Continue Conversation
```http
POST /llm/chat/continue
Content-Type: application/json

{
  "state": {
    "messages": [...],
    "goal_amount_eth": null,
    "deadline_days": null,
    "recipient_address": null,
    "goal_description": "I want to buy a new laptop",
    "conversation_complete": false
  },
  "message": "2.5 ETH"
}
```

## Conversation Flow

1. **Greeting**: Agent introduces itself and explains the process
2. **Goal Collection**: Asks user to describe their goal
3. **Amount Collection**: Asks for ETH amount needed
4. **Deadline Collection**: Asks for deadline in days
5. **Recipient Collection**: Asks for Ethereum address
6. **Confirmation**: Shows summary and confirms details

## Example Conversation

```
Agent: Hello! I'm your DreamPool concierge. I'll help you create a funding pool for your goal.

To get started, I need to collect some information:
1. What's your goal? (brief description)
2. How much ETH do you need to raise?
3. When do you need the funds by? (in days)
4. Who should receive the funds? (Ethereum address)

Let's start with your goal - what are you trying to achieve?

User: I want to buy a new laptop for my work

Agent: Great! So you want to: I want to buy a new laptop for my work

Now, how much ETH do you need to raise for this goal?

User: 2.5 ETH

Agent: Perfect! You need 2.5 ETH. That's 2,500,000,000,000,000,000 Wei.

When do you need the funds by? Please tell me in days (e.g., '30 days', '2 weeks', '1 month').

User: 30 days

Agent: Got it! Deadline set for 30 days from now (2024-02-15).

Finally, who should receive the funds? Please provide an Ethereum address (0x...).

User: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

Agent: Perfect! Here's a summary of your pool:

🎯 **Goal**: I want to buy a new laptop for my work
💰 **Amount**: 2.5 ETH (2,500,000,000,000,000,000 Wei)
⏰ **Deadline**: 30 days (2024-02-15)
👤 **Recipient**: 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

Your pool is ready to be created! The smart contract will handle the fundraising and ensure funds are only released if the goal is met by the deadline.
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
# Copy the example file
cp env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the backend:
```bash
python main.py
```

## Testing

Run the test script to verify the conversation flow:
```bash
python test_conversation.py
```

## Frontend Integration

The frontend `ChatConcierge` component has been updated to use the new conversation flow. It:
- Starts conversations with the LLM agent
- Maintains conversation state
- Displays messages in a chat interface
- Shows goal confirmation when complete
- Handles errors gracefully

## Error Handling

The agent handles various error scenarios:
- Invalid ETH amounts (asks for clarification)
- Invalid deadline formats (provides examples)
- Invalid Ethereum addresses (validates format)
- Network errors (shows user-friendly messages)

## Future Enhancements

- Integration with smart contract for actual pool creation
- Support for multiple currencies
- Advanced goal categorization
- Integration with wallet providers
- Conversation history persistence
