from schemas import ProposedGoal, EncodedTx
import time
import os
import hashlib

class ABIEncoder:
    def __init__(self):
        # Contract address (placeholder - should be set to actual deployed contract)
        self.contract_address = os.getenv("CONTRACT_ADDRESS", "0x1234567890123456789012345678901234567890")
        
    async def encode_create_pool(self, goal: ProposedGoal) -> EncodedTx:
        """Encode createPool function call"""
        try:
            # For demo purposes, return a mock transaction
            # TODO: Implement proper ABI encoding when web3 is available
            
            # Convert cost to wei
            cost_wei = int(goal.cost_eth * 10**18)
            
            # Calculate deadline timestamp
            deadline_timestamp = int(time.time()) + (goal.deadline_days * 24 * 60 * 60)
            
            # Create metadata JSON
            metadata = {
                "title": goal.title,
                "description": goal.description or "",
                "created_at": int(time.time())
            }
            metadata_json = str(metadata).replace("'", '"')
            
            # Mock function selector (first 4 bytes of keccak256 hash)
            # In a real implementation, this would be: Web3.keccak(text="createPool(address,uint256,uint256,string)")[:4]
            function_selector = "0x12345678"  # Mock selector
            
            # Mock encoded parameters
            # In a real implementation, this would use eth_abi.encode()
            mock_data = f"{function_selector}{goal.recipient[2:]}{cost_wei:064x}{deadline_timestamp:064x}{len(metadata_json.encode()):064x}{metadata_json.encode().hex()}"
            
            return EncodedTx(
                to=self.contract_address,
                data=mock_data,
                value=0  # No ETH value needed for createPool
            )
            
        except Exception as e:
            raise Exception(f"Failed to encode createPool transaction: {str(e)}")
    
    def encode_deposit(self, pool_id: int, amount_wei: int) -> str:
        """Encode deposit function call"""
        try:
            # Mock function selector for deposit(uint256)
            function_selector = "0x87654321"  # Mock selector
            
            # Mock encoded parameters
            mock_data = f"{function_selector}{pool_id:064x}"
            
            return mock_data
            
        except Exception as e:
            raise Exception(f"Failed to encode deposit transaction: {str(e)}")
