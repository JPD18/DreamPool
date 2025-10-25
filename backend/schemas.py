from typing import Optional
from datetime import datetime

# Basic data classes without Pydantic for now
class ChatInput:
    def __init__(self, message: str):
        self.message = message

class ProposedGoal:
    def __init__(self, title: str, cost_eth: float, deadline_days: int, recipient: str, description: Optional[str] = None):
        self.title = title
        self.cost_eth = cost_eth
        self.deadline_days = deadline_days
        self.recipient = recipient
        self.description = description

class EncodedTx:
    def __init__(self, to: str, data: str, value: int = 0):
        self.to = to
        self.data = data
        self.value = value

class PoolData:
    def __init__(self, pool_id: int, recipient: str, goal_amount: int, deadline: int, 
                 raised_amount: int, status: str, title: str, description: str):
        self.pool_id = pool_id
        self.recipient = recipient
        self.goal_amount = goal_amount
        self.deadline = deadline
        self.raised_amount = raised_amount
        self.status = status
        self.title = title
        self.description = description

class ErrorResponse:
    def __init__(self, error: str, detail: Optional[str] = None):
        self.error = error
        self.detail = detail
