"""
Base LLM Interface for AURA
Provides unified abstraction for multiple LLM providers
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional


class BaseLLM(ABC):
    """Abstract base class for LLM providers"""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name
    
    @abstractmethod
    def generate(self, prompt: str, system_prompt: Optional[str] = None, 
                 temperature: float = 0.7, max_tokens: int = 500) -> str:
        """
        Generate text completion from the LLM
        
        Args:
            prompt: User prompt/query
            system_prompt: Optional system instruction
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text response
        """
        pass
    
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], 
             temperature: float = 0.7, max_tokens: int = 500) -> str:
        """
        Chat completion with conversation history
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated response
        """
        pass
    
    def is_available(self) -> bool:
        """Check if the LLM provider is available"""
        try:
            self.generate("test", max_tokens=5)
            return True
        except:
            return False
