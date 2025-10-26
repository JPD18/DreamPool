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

# Hardcoded recipient for now
HARDCODED_RECIPIENT = "0xC895f03A4982E39bE52Bc686432724583aAF2d8D"


class AgentState(TypedDict):
    """State for the LangGraph agent"""
    messages: Annotated[List[BaseMessage], add_messages]
    goal_description: Optional[str]
    goal_amount_eth: Optional[float]
    deadline_days: Optional[int]
    recipient_address: Optional[str]
    conversation_complete: bool
    contract_payload: Optional[Dict[str, Any]]


# Standalone tool functions
@tool
def extract_goal_description(user_message: str) -> str:
    """Extract and store the goal description from user message. Use this tool whenever a user provides their goal or describes what they want to achieve."""
    return f"Goal description extracted: {user_message}"


@tool
def extract_eth_amount(amount_text: str) -> str:
    """Extract ETH amount from text and convert to Wei. Use this tool whenever a user mentions an ETH amount they need."""
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
def extract_deadline(deadline_text: str) -> str:
    """Extract deadline in days from text. Use this tool whenever a user mentions a time period or deadline."""
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
def validate_ethereum_address(address: str) -> str:
    """Validate Ethereum address format. Use this tool to validate any Ethereum address provided by the user."""
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
def prepare_contract_payload(goal_description: str, amount_eth: float, deadline_days: int) -> str:
    """Prepare the contract payload with all goal information. Use this tool ONLY when all required information has been collected and conversation is complete."""
    amount_wei = int(amount_eth * 10**18)
    deadline_timestamp = int((datetime.now() + timedelta(days=deadline_days)).timestamp())
    
    payload = {
        "goal_description": goal_description,
        "goal_amount_wei": amount_wei,
        "goal_amount_eth": amount_eth,
        "deadline_timestamp": deadline_timestamp,
        "deadline_days": deadline_days,
        "recipient_address": HARDCODED_RECIPIENT,
        "created_at": datetime.now().isoformat()
    }
    
    return f"Contract payload prepared: {json.dumps(payload, indent=2)}"


@tool
def check_conversation_complete(goal_description: str, amount_eth: float, deadline_days: int) -> str:
    """Check if all required information has been collected. Use this tool to determine if you have all needed information before proceeding."""
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


class DreamPoolReActAgent:
    """LangGraph ReAct agent for DreamPool goal creation"""
    
    def __init__(self):
        # Initialize the LLM
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Create the graph
        self.graph = self._create_graph()
    
    def _create_graph(self) -> StateGraph:
        """Create the LangGraph workflow"""
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", self._call_agent)
        workflow.add_node("tools", self._process_tools)
        
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
    
    def _process_tools(self, state: AgentState) -> AgentState:
        """Process tool calls, execute tools, and extract values to update state"""
        last_message = state["messages"][-1]

        if not hasattr(last_message, 'tool_calls') or not last_message.tool_calls:
            return state

        # Create a ToolNode to execute the tools
        tool_node = ToolNode(self._get_tools())

        # Execute tools - this will add ToolMessages to the state
        result = tool_node.invoke(state)

        # Extract values from tool results and update state
        new_state = result.copy()

        # Look through messages for tool results
        for msg in result["messages"]:
            if isinstance(msg, ToolMessage):
                tool_result = msg.content
                tool_name = msg.name if hasattr(msg, 'name') else ""

                # Extract goal description
                if tool_name == "extract_goal_description" and "Goal description extracted:" in tool_result:
                    new_state["goal_description"] = tool_result.split("Goal description extracted: ", 1)[1]

                # Extract ETH amount
                elif tool_name == "extract_eth_amount":
                    if "Extracted" in tool_result and "ETH" in tool_result:
                        # Handle success case: "Extracted 2.5 ETH (2,500,000,000,000,000,000 Wei)"
                        match = re.search(r'Extracted ([\d.]+) ETH', tool_result)
                        if match:
                            new_state["goal_amount_eth"] = float(match.group(1))

                # Extract deadline
                elif tool_name == "extract_deadline":
                    if "Extracted deadline:" in tool_result:
                        # Handle success case: "Extracted deadline: 30 days (2 weeks)"
                        match = re.search(r'Extracted deadline: (\d+) days', tool_result)
                        if match:
                            new_state["deadline_days"] = int(match.group(1))

                # Extract contract payload
                elif tool_name == "prepare_contract_payload":
                    if "Contract payload prepared:" in tool_result:
                        payload_str = tool_result.split("Contract payload prepared: ", 1)[1]
                        try:
                            new_state["contract_payload"] = json.loads(payload_str)
                            new_state["conversation_complete"] = True
                        except json.JSONDecodeError:
                            pass
        return new_state

    def _get_tools(self) -> List:
        """Define tools for the agent"""
        return [
            extract_goal_description,
            extract_eth_amount,
            extract_deadline,
            validate_ethereum_address,
            prepare_contract_payload,
            check_conversation_complete
        ]
    
    def _call_agent(self, state: AgentState) -> AgentState:
        """Call the LLM agent with current state"""
        # Add system message with context
        system_message = """You are a DreamPool concierge helping users create funding pools for their goals.

Your task is to collect the following information:
1. Goal description (what they want to achieve)
2. ETH amount needed (how much they need to raise)
3. Deadline in days (when they need the funds)

You have access to tools to extract and validate this information. You MUST use the tools to process user input and extract the required data.

CONVERSATION FLOW:
1. When you receive a user message, FIRST use the extraction tools to parse the information
2. Use extract_goal_description for the user's goal
3. Use extract_eth_amount for any ETH amounts mentioned
4. Use extract_deadline for any time periods mentioned
5. Use check_conversation_complete to see if you have all required information
6. If all information is collected, use prepare_contract_payload
7. Only respond conversationally after using the appropriate tools

Current state:
- Goal description: {goal_description}
- ETH amount: {goal_amount_eth}
- Deadline: {deadline_days}
- Conversation complete: {conversation_complete}

ALWAYS use tools first to extract information from user messages, then provide a friendly response.""".format(
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
        
        # If the last message is an AI message without tool calls, end
        if isinstance(last_message, AIMessage):
            return "end"
        
        # If conversation is complete, end
        if state.get("conversation_complete", False):
            return "end"
        
        # Otherwise, end to prevent infinite loop
        return "end"
    
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

        # Convert messages to a format suitable for API response while preserving structure
        messages = []
        for msg in final_state["messages"]:
            if isinstance(msg, BaseMessage):
                message_dict = {
                    "type": msg.__class__.__name__,
                    "content": msg.content
                }
                # Add additional metadata if available
                if hasattr(msg, 'tool_calls') and msg.tool_calls:
                    message_dict["tool_calls"] = msg.tool_calls
                if hasattr(msg, 'tool_call_id') and msg.tool_call_id:
                    message_dict["tool_call_id"] = msg.tool_call_id
                messages.append(message_dict)

        return {
            "messages": messages,
            "goal_description": final_state.get("goal_description"),
            "goal_amount_eth": final_state.get("goal_amount_eth"),
            "deadline_days": final_state.get("deadline_days"),
            "recipient_address": final_state.get("recipient_address"),
            "conversation_complete": final_state.get("conversation_complete", False),
            "contract_payload": final_state.get("contract_payload")
        }
    
    async def continue_conversation(self, state_dict: Dict[str, Any], user_message: str) -> Dict[str, Any]:
        """Continue an existing conversation"""
        # Reconstruct messages from the structured format
        messages = []
        for msg_dict in state_dict.get("messages", []):
            if isinstance(msg_dict, dict) and "type" in msg_dict:
                content = msg_dict.get("content", "")
                msg_type = msg_dict.get("type")

                if msg_type == "HumanMessage":
                    msg = HumanMessage(content=content)
                elif msg_type == "AIMessage":
                    msg = AIMessage(content=content)
                    # Add tool calls if present
                    if "tool_calls" in msg_dict:
                        msg.tool_calls = msg_dict["tool_calls"]
                elif msg_type == "ToolMessage":
                    msg = ToolMessage(content=content, tool_call_id=msg_dict.get("tool_call_id", ""))
                    if "name" in msg_dict:
                        msg.name = msg_dict["name"]
                else:
                    # Fallback for unknown message types
                    msg = HumanMessage(content=str(msg_dict))
                messages.append(msg)
            else:
                # Fallback for old string format
                if isinstance(msg_dict, str):
                    if len(messages) % 2 == 0:
                        messages.append(HumanMessage(content=msg_dict))
                    else:
                        messages.append(AIMessage(content=msg_dict))

        # Add the new user message
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

        # Convert messages to structured format for API response
        messages = []
        for msg in final_state["messages"]:
            if isinstance(msg, BaseMessage):
                message_dict = {
                    "type": msg.__class__.__name__,
                    "content": msg.content
                }
                # Add additional metadata if available
                if hasattr(msg, 'tool_calls') and msg.tool_calls:
                    message_dict["tool_calls"] = msg.tool_calls
                if hasattr(msg, 'tool_call_id') and msg.tool_call_id:
                    message_dict["tool_call_id"] = msg.tool_call_id
                if hasattr(msg, 'name') and msg.name:
                    message_dict["name"] = msg.name
                messages.append(message_dict)

        return {
            "messages": messages,
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
                recipient=conversation.get("recipient_address", HARDCODED_RECIPIENT),
                description=conversation.get("goal_description", "")
            )
            
        except Exception as e:
            print(f"Error in parse_goal: {e}")
            # Fallback to simple parsing
            return ProposedGoal(
                title=f"Goal: {message[:50]}...",
                cost_eth=1.0,
                deadline_days=30,
                recipient=HARDCODED_RECIPIENT,
                description=message
            )
