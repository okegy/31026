"""
Notion Database Configuration
"""
from datetime import datetime, timezone
import os

# Your Notion database ID (from the URL: https://www.notion.so/your-workspace/2ce06e11832e8091a3b7d78e39f5524e)
NOTION_DATABASE_ID = "2ce06e11832e8091a3b7d78e39f5524e"

# Property names in your Notion database (case sensitive)
PROPERTIES = {
    "TITLE": "Name",  # The main title property
    "STATUS": "Status",
    "PRIORITY": "Priority",
    "DEADLINE": "Due",
    "CREATED_AT": "Created At",
    "LAST_UPDATED": "Last Updated",
    "DESCRIPTION": "Description",
    "TAGS": "Tags"
}

# Status options in your Notion database
STATUS_OPTIONS = {
    "PENDING": "Not Started",
    "IN_PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "MISSED": "Missed"
}

# Priority options in your Notion database
PRIORITY_OPTIONS = {
    "LOW": "Low",
    "MEDIUM": "Medium",
    "HIGH": "High"
}

def get_current_time():
    """Get current time in ISO format with timezone"""
    return datetime.now(timezone.utc).astimezone().isoformat()

def parse_notion_date(date_str: str) -> datetime:
    """Parse Notion date string to datetime object"""
    try:
        # Handle both date and datetime strings
        if 'T' in date_str:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return datetime.fromisoformat(date_str)
    except (ValueError, TypeError):
        return datetime.now(timezone.utc)
