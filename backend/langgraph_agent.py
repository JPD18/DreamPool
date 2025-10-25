import os
from typing import Dict, Any, Optional, List, TypedDict, Annotated
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages
from schemas import ProposedGoal
import json
from datetime import datetime, timedelta
import re


class AgentState(TypedDict):
    """State for the LangGraph agent"""
    messages: Annotated[List[BaseMessage], add_messages]
    goal_description: Optional[str]
    goal_amount_eth: Optional[float]
    deadline_days: Optional[int]
    recipient_address: Optional[str]
    conversation_complete: bool
    contract_payload: Optional[Dict[str, Any]]


class DreamPoolReActAgent:
    """LangGraph ReAct agent for DreamPool goal creation"""
    
    def __init__(self):
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Hardcoded recipient for now
        self.hardcoded_recipient = "0xcC31859af72EaFE13C843d4A5C5d3784B5615677"
        
        # Create the graph
        self.graph = self._create_graph()
    
    def _create_graph(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", self._call_agent)
        workflow.add_node("tools", ToolNode(self._get_tools()))
        
        # Add edges
        workflow.set_entry_point("agent")
        workflow.add_conditional_edges(
            "agent",
            self._should_continue,
            {
                "continue": "tools",
                "end": END
            }
        )
        workflow.add_edge("tools", "agent")
        
        return workflow.compile()
    
    def _get_tools(self) -> List:
        """Define tools for the agent"""
        return [
            self._extract_goal_description,
            self._extract_eth_amount,
            self._extract_deadline,
            self._validate_ethereum_address,
            self._prepare_contract_payload,
            self._check_conversation_complete
        ]
    
    @tool
    def _extract_goal_description(self, user_message: str) -> str:
        """Extract and store the goal description from user message"""
        return f"Goal description extracted: {user_message}"
    
    @tool
    def _extract_eth_amount(self, amount_text: str) -> str:
        """Extract ETH amount from text and convert to Wei"""
        patterns = [
            r'(\d+\.?\d*)\s*eth',
            r'(\d+\.?\d*)\s*ether',
            r'^(\d+\.?\d*)$'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, amount_text.lower())
            if match:
                try:
                    amount_eth = float(match.group(1))
                    amount_wei = int(amount_eth * 10**18)
                    return f"Extracted {amount_eth} ETH ({amount_wei:,} Wei)"
                except ValueError:
                    continue
        return "Could not extract ETH amount. Please provide a clear amount (e.g., '2.5 ETH')"
    
    @tool
    def _extract_deadline(self, deadline_text: str) -> str:
        """Extract deadline in days from text"""
        text_lower = deadline_text.lower()
        
        # Look for patterns like "30 days", "2 weeks", "1 month"
        day_patterns = [r'(\d+)\s*days?', r'(\d+)\s*d']
        week_patterns = [r'(\d+)\s*weeks?', r'(\d+)\s*w']
        month_patterns = [r'(\d+)\s*months?', r'(\d+)\s*m']
        
        for pattern in day_patterns:
            match = re.search(pattern, text_lower)
            if match:
                days = int(match.group(1))
                return f"Extracted deadline: {days} days"
        
        for pattern in week_patterns:
            match = re.search(pattern, text_lower)
            if match:
                days = int(match.group(1)) * 7
                return f"Extracted deadline: {days} days ({match.group(1)} weeks)"
        
        for pattern in month_patterns:
            match = re.search(pattern, text_lower)
            if match:
                days = int(match.group(1)) * 30
                return f"Extracted deadline: {days} days ({match.group(1)} months)"
        
        return "Could not extract deadline. Please specify in days, weeks, or months"
    
    @tool
    def _validate_ethereum_address(self, address: str) -> str:
        """Validate Ethereum address format"""
        if not address.startswith('0x'):
            return "Invalid address: must start with 0x"
        if len(address) != 42:
            return "Invalid address: must be 42 characters long"
        try:
            int(address[2:], 16)
            return f"Valid Ethereum address: {address}"
        except ValueError:
            return "Invalid address: contains non-hex characters"
    
    @tool
    def _prepare_contract_payload(self, goal_description: str, amount_eth: float, deadline_days: int) -> str:
        """Prepare the contract payload with all goal information"""
        amount_wei = int(amount_eth * 10**18)
        deadline_timestamp = int((datetime.now() + timedelta(days=deadline_days)).timestamp())
        
        payload = {
            "goal_description": goal_description,
            "goal_amount_wei": amount_wei,
            "goal_amount_eth": amount_eth,
            "deadline_timestamp": deadline_timestamp,
            "deadline_days": deadline_days,
            "recipient_address": self.hardcoded_recipient,
            "created_at": datetime.now().isoformat()
        }
        
        return f"Contract payload prepared: {json.dumps(payload, indent=2)}"
    
    @tool
    def _check_conversation_complete(self, goal_description: str, amount_eth: float, deadline_days: int) -> str:
        """Check if all required information has been collected"""
        if goal_description and amount_eth and deadline_days:
            return "Conversation complete! All required information collected."
        else:
            missing = []
            if not goal_description:
                missing.append("goal description")
            if not amount_eth:
                missing.append("ETH amount")
            if not deadline_days:
                missing.append("deadline")
            return f"Still missing: {', '.join(missing)}"
    
    def _call_agent(self, state: AgentState) -> AgentState:
        """Call the LLM agent with current state"""
        # Add system message with context
        system_message = """You are a DreamPool concierge helping users create funding pools for their goals.

Your task is to collect the following information:
1. Goal description (what they want to achieve)
2. ETH amount needed (how much they need to raise)
3. Deadline in days (when they need the funds)

You have access to tools to extract and validate this information. Use the tools to process user input and extract the required data.

Be friendly, helpful, and guide users through this process step by step. Ask one question at a time and acknowledge their responses.

Current state:
- Goal description: {goal_description}
- ETH amount: {goal_amount_eth}
- Deadline: {deadline_days}
- Conversation complete: {conversation_complete}

Use the appropriate tools to extract information from user messages and prepare the contract payload when all information is collected.""".format(
            goal_description=state.get("goal_description", "Not provided"),
            goal_amount_eth=state.get("goal_amount_eth", "Not provided"),
            deadline_days=state.get("deadline_days", "Not provided"),
            conversation_complete=state.get("conversation_complete", False)
        )
        
        messages = [{"role": "system", "content": system_message}] + state["messages"]
        
        # Get response from LLM
        response = self.llm.bind_tools(self._get_tools()).invoke(messages)
        
        return {"messages": [response]}
    
    def _should_continue(self, state: AgentState) -> str:
        """Determine if the conversation should continue"""
        last_message = state["messages"][-1]
        
        # If the last message has tool calls, continue to tools
        if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
            return "continue"
        
        # If conversation is complete, end
        if state.get("conversation_complete", False):
            return "end"
        
        # Otherwise, continue
        return "continue"
    
    async def start_conversation(self, initial_message: str = "") -> Dict[str, Any]:
        """Start a new conversation with the agent"""
        initial_state = {
            "messages": [HumanMessage(content=initial_message or "Hello! I'd like to create a funding pool for my goal.")],
            "goal_description": None,
            "goal_amount_eth": None,
            "deadline_days": None,
            "recipient_address": None,
            "conversation_complete": False,
            "contract_payload": None
        }
        
        # Run the graph
        final_state = self.graph.invoke(initial_state)
        
        return {
            "messages": [msg.content for msg in final_state["messages"] if hasattr(msg, 'content')],
            "goal_description": final_state.get("goal_description"),
            "goal_amount_eth": final_state.get("goal_amount_eth"),
            "deadline_days": final_state.get("deadline_days"),
            "recipient_address": final_state.get("recipient_address"),
            "conversation_complete": final_state.get("conversation_complete", False),
            "contract_payload": final_state.get("contract_payload")
        }
    
    async def continue_conversation(self, state_dict: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        """Continue an existing conversation"""
        # Reconstruct state
        messages = [HumanMessage(content=msg) if i % 2 == 0 else AIMessage(content=msg) 
                   for i, msg in enumerate(state_dict.get("messages", []))]
        messages.append(HumanMessage(content=user_message))
        
        current_state = {
            "messages": messages,
            "goal_description": state_dict.get("goal_description"),
            "goal_amount_eth": state_dict.get("goal_amount_eth"),
            "deadline_days": state_dict.get("deadline_days"),
            "recipient_address": state_dict.get("recipient_address"),
            "conversation_complete": state_dict.get("conversation_complete", False),
            "contract_payload": state_dict.get("contract_payload")
        }
        
        # Run the graph
        final_state = self.graph.invoke(current_state)
        
        return {
            "messages": [msg.content for msg in final_state["messages"] if hasattr(msg, 'content')],
            "goal_description": final_state.get("goal_description"),
            "goal_amount_eth": final_state.get("goal_amount_eth"),
            "deadline_days": final_state.get("deadline_days"),
            "recipient_address": final_state.get("recipient_address"),
            "conversation_complete": final_state.get("conversation_complete", False),
            "contract_payload": final_state.get("contract_payload")
        }
    
    # Legacy method for backward compatibility
    async def parse_goal(self, message: str) -> ProposedGoal:
        """Parse user message and extract structured goal information"""
        try:
            conversation = await self.start_conversation(message)
            
            return ProposedGoal(
                title=conversation.get("goal_description", "Unknown Goal"),
                cost_eth=conversation.get("goal_amount_eth", 1.0),
                deadline_days=conversation.get("deadline_days", 30),
                recipient=conversation.get("recipient_address", self.hardcoded_recipient),
                description=conversation.get("goal_description", "")
            )
            
        except Exception as e:
            print(f"Error in parse_goal: {e}")
            # Fallback to simple parsing
            return ProposedGoal(
                title=f"Goal: {message[:50]}...",
                cost_eth=1.0,
                deadline_days=30,
                recipient=self.hardcoded_recipient,
                description=message
            )
