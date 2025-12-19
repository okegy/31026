"""
Configuration Settings for AURA
Manages environment variables and system configuration
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Settings:
    """Central configuration for AURA system"""
    
    # LLM Configuration
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "ollama").lower()
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama2")
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    
    # Notion Configuration
    NOTION_API_KEY: Optional[str] = os.getenv("NOTION_API_KEY")
    NOTION_DATABASE_ID: Optional[str] = os.getenv("NOTION_DATABASE_ID")
    
    # Google APIs (for future integration)
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: Optional[str] = os.getenv("GOOGLE_CLIENT_SECRET")
    
    # Application Settings
    USER_EMAIL: str = os.getenv("USER_EMAIL", "user@example.com")
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"
    
    @classmethod
    def validate(cls) -> bool:
        """Validate critical configuration"""
        issues = []
        
        if cls.LLM_PROVIDER == "openai" and not cls.OPENAI_API_KEY:
            issues.append("⚠️  OpenAI provider selected but OPENAI_API_KEY not set")
        
        if not cls.NOTION_API_KEY:
            issues.append("⚠️  NOTION_API_KEY not set - will run in mock mode")
        
        if not cls.NOTION_DATABASE_ID:
            issues.append("⚠️  NOTION_DATABASE_ID not set - some features limited")
        
        if issues:
            print("\n🔧 Configuration Issues:")
            for issue in issues:
                print(f"   {issue}")
            print()
        
        return True  # Non-blocking for hackathon
    
    @classmethod
    def print_config(cls):
        """Print current configuration (safe)"""
        print("\n" + "="*60)
        print("🤖 AURA CONFIGURATION")
        print("="*60)
        print(f"LLM Provider:     {cls.LLM_PROVIDER.upper()}")
        print(f"OpenAI Model:     {cls.OPENAI_MODEL if cls.LLM_PROVIDER == 'openai' else 'N/A'}")
        print(f"Ollama Model:     {cls.OLLAMA_MODEL if cls.LLM_PROVIDER == 'ollama' else 'N/A'}")
        print(f"Notion Enabled:   {'Yes' if cls.NOTION_API_KEY else 'No (Mock Mode)'}")
        print(f"Demo Mode:        {'Enabled' if cls.DEMO_MODE else 'Disabled'}")
        print(f"User Email:       {cls.USER_EMAIL}")
        print("="*60 + "\n")


# Global settings instance
settings = Settings()
