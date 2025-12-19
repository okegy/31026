"""
Notion Integration Tool for AURA
Persistent task memory using Notion database
"""
import os
import json
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Union

from config.notion_config import (
    NOTION_DATABASE_ID,
    PROPERTIES,
    STATUS_OPTIONS,
    PRIORITY_OPTIONS,
    get_current_time,
    parse_notion_date
)

try:
    from notion_client import Client, APIErrorCode, APIResponseError
    NOTION_AVAILABLE = True
except ImportError:
    NOTION_AVAILABLE = False
    print("⚠️  Notion SDK not installed. Run: pip install notion-client")


class NotionTool:
    """Notion database integration for task persistence"""
    
    def __init__(self, api_key: Optional[str] = None, database_id: Optional[str] = None):
        self.api_key = api_key or os.getenv("NOTION_API_KEY")
        self.database_id = database_id or NOTION_DATABASE_ID
        self.mock_mode = False
        self.mock_tasks = []  # In-memory fallback
        
        if not NOTION_AVAILABLE:
            print("⚠️  Notion SDK not available. Running in MOCK mode.")
            self.mock_mode = True
            return
        
        if not self.api_key:
            print("⚠️  Notion API key not found. Please set NOTION_API_KEY environment variable.")
            print("    Running in MOCK mode. Some features will be limited.")
            self.mock_mode = True
            return
        
        try:
            self.client = Client(auth=self.api_key, log_level="WARNING")
            print(f"✓ Notion client initialized")
            
            if self.database_id:
                # Verify database access and schema
                self._verify_database_schema()
                print(f"✓ Connected to Notion database: {self.database_id}")
            else:
                print("⚠️  No database ID provided. Some features may be limited.")
        except Exception as e:
            print(f"⚠️  Notion connection failed: {str(e)}")
            print("    Running in MOCK mode. Some features will be limited.")
            self.mock_mode = True
    
    def _verify_database_schema(self) -> None:
        """Verify that the database has the required properties"""
        try:
            db = self.client.databases.retrieve(database_id=self.database_id)
            db_props = db.get("properties", {})
            
            # Check required properties
            required_props = [
                PROPERTIES["TITLE"],
                PROPERTIES["STATUS"],
                PROPERTIES["PRIORITY"],
                PROPERTIES["DEADLINE"]
            ]
            
            missing_props = [prop for prop in required_props if prop not in db_props]
            if missing_props:
                print(f"⚠️  Missing required properties in Notion database: {', '.join(missing_props)}")
                print("    Some features may not work as expected.")
            
            return True
            
        except Exception as e:
            print(f"⚠️  Failed to verify database schema: {str(e)}")
            return False
    
    def _format_properties(self, task_name: str, deadline: Optional[str] = None,
                         priority: str = "Medium", status: str = "Not Started",
                         description: str = "") -> Dict[str, Any]:
        """Format task properties according to Notion API format"""
        properties = {
            PROPERTIES["TITLE"]: {
                "title": [{"text": {"content": task_name}}]
            },
            PROPERTIES["STATUS"]: {
                "select": {"name": status or STATUS_OPTIONS["PENDING"]}
            },
            PROPERTIES["PRIORITY"]: {
                "select": {"name": priority.capitalize() or PRIORITY_OPTIONS["MEDIUM"]}
            },
            PROPERTIES["LAST_UPDATED"]: {
                "date": {"start": get_current_time()}
            }
        }
        
        # Add deadline if provided
        if deadline:
            properties[PROPERTIES["DEADLINE"]] = {"date": {"start": deadline}}
        
        # Add description if provided
        if description:
            properties[PROPERTIES["DESCRIPTION"]] = {
                "rich_text": [{"text": {"content": description}}]
            }
            
        return properties
    
    def create_task(self, task_name: str, deadline: Optional[str] = None,
                   priority: str = "Medium", description: str = "") -> Dict:
        """
        Create a new task in Notion database
        
        Args:
            task_name: Title of the task
            deadline: ISO format deadline date
            priority: Low, Medium, or High
            description: Task description
            
        Returns:
            Created task data
        """
        if self.mock_mode:
            return self._mock_create_task(task_name, deadline, priority, description)
        
        try:
            # Format properties according to Notion API
            properties = self._format_properties(
                task_name=task_name,
                deadline=deadline,
                priority=priority,
                description=description
            )
            
            # Add creation timestamp
            properties[PROPERTIES["CREATED_AT"]] = {"date": {"start": get_current_time()}}
            
            # Create the page in Notion
            response = self.client.pages.create(
                parent={"database_id": self.database_id},
                properties=properties
            )
            
            print(f"✓ Task created in Notion: {task_name}")
            return {
                "id": response["id"],
                "task_name": task_name,
                "status": STATUS_OPTIONS["PENDING"],
                "priority": priority,
                "deadline": deadline,
                "created_at": get_current_time()
            }
            
        except APIResponseError as e:
            if e.code == APIErrorCode.ObjectNotFound:
                print(f"⚠️  Database not found. Please check your database ID and API key.")
            elif e.code == APIErrorCode.Unauthorized:
                print("⚠️  Notion API key is invalid or doesn't have access to the database.")
            else:
                print(f"⚠️  Notion API error: {str(e)}")
            
            # Fall back to mock mode for this operation
            print("    Falling back to mock mode for this operation.")
            return self._mock_create_task(task_name, deadline, priority, description)
            
        except Exception as e:
            print(f"⚠️  Failed to create task: {str(e)}")
            print("    Falling back to mock mode for this operation.")
            return self._mock_create_task(task_name, deadline, priority, description)
    
    def update_task_status(self, task_id: str, status: str) -> bool:
        """
        Update task status in Notion
        
        Args:
            task_id: Notion page ID
            status: Status to set (will be mapped to your Notion status options)
            
        Returns:
            Success status
        """
        if self.mock_mode:
            return self._mock_update_status(task_id, status)
        
        try:
            # Map status to your Notion status options
            status_mapping = {
                "pending": STATUS_OPTIONS["PENDING"],
                "completed": STATUS_OPTIONS["COMPLETED"],
                "missed": STATUS_OPTIONS["MISSED"],
                "in_progress": STATUS_OPTIONS["IN_PROGRESS"]
            }
            
            # Get the mapped status or use the original if not found
            mapped_status = status_mapping.get(status.lower(), status)
            
            self.client.pages.update(
                page_id=task_id,
                properties={
                    PROPERTIES["STATUS"]: {"select": {"name": mapped_status}},
                    PROPERTIES["LAST_UPDATED"]: {"date": {"start": get_current_time()}}
                }
            )
            print(f"✓ Task status updated to: {mapped_status}")
            return True
            
        except APIResponseError as e:
            if e.code == APIErrorCode.ObjectNotFound:
                print(f"⚠️  Task with ID {task_id} not found.")
            else:
                print(f"⚠️  Notion API error: {str(e)}")
            return False
            
        except Exception as e:
            print(f"⚠️  Failed to update task status: {str(e)}")
            return False
    
    def _parse_task_from_page(self, page: Dict) -> Dict:
        """Parse a Notion page into a task dictionary"""
        props = page.get("properties", {})
        
        # Get title
        title_prop = props.get(PROPERTIES["TITLE"], {})
        task_name = ""
        if title_prop.get("title"):
            task_name = title_prop["title"][0].get("text", {}).get("content", "")
        
        # Get status
        status_prop = props.get(PROPERTIES["STATUS"], {}).get("select", {})
        status = status_prop.get("name", STATUS_OPTIONS["PENDING"])
        
        # Get priority
        priority_prop = props.get(PROPERTIES["PRIORITY"], {}).get("select", {})
        priority = priority_prop.get("name", PRIORITY_OPTIONS["MEDIUM"])
        
        # Get deadline
        deadline_prop = props.get(PROPERTIES["DEADLINE"], {}).get("date", {})
        deadline = deadline_prop.get("start") if deadline_prop else None
        
        # Get creation time
        created_prop = props.get(PROPERTIES["CREATED_AT"], {}).get("date", {})
        created_at = created_prop.get("start") or page.get("created_time", "")
        
        # Get last updated time
        last_updated_prop = props.get(PROPERTIES["LAST_UPDATED"], {}).get("date", {})
        last_updated = last_updated_prop.get("start") or page.get("last_edited_time", "")
        
        # Get description
        description_prop = props.get(PROPERTIES["DESCRIPTION"], {}).get("rich_text", [])
        description = description_prop[0]["plain_text"] if description_prop else ""
        
        return {
            "id": page["id"],
            "task_name": task_name,
            "status": status,
            "priority": priority,
            "deadline": deadline,
            "created_at": created_at,
            "last_updated": last_updated,
            "description": description,
            "url": page.get("url", "")
        }
    
    def get_pending_tasks(self) -> List[Dict]:
        """Get all pending tasks from Notion"""
        if self.mock_mode:
            return [t for t in self.mock_tasks if t["status"] == STATUS_OPTIONS["PENDING"]]
        
        try:
            response = self.client.databases.query(
                database_id=self.database_id,
                filter={
                    "and": [
                        {
                            "property": PROPERTIES["STATUS"],
                            "select": {"equals": STATUS_OPTIONS["PENDING"]}
                        },
                        {
                            "property": PROPERTIES["DEADLINE"],
                            "date": {"is_not_empty": True}
                        }
                    ]
                },
                sorts=[
                    {
                        "property": PROPERTIES["DEADLINE"],
                        "direction": "ascending"
                    }
                ]
            )
            
            return [self._parse_task_from_page(page) for page in response.get("results", [])]
            
        except APIResponseError as e:
            if e.code == APIErrorCode.ObjectNotFound:
                print("⚠️  Database not found. Please check your database ID and API key.")
            else:
                print(f"⚠️  Notion API error: {str(e)}")
            return []
            
        except Exception as e:
            print(f"⚠️  Failed to fetch pending tasks: {str(e)}")
            return []
    
    def get_task(self, task_id: str) -> Optional[Dict]:
        """Get a single task by ID"""
        if self.mock_mode:
            return next((t for t in self.mock_tasks if t["id"] == task_id), None)
            
        try:
            page = self.client.pages.retrieve(page_id=task_id)
            return self._parse_task_from_page(page)
            
        except APIResponseError as e:
            if e.code == APIErrorCode.ObjectNotFound:
                print(f"⚠️  Task with ID {task_id} not found.")
            else:
                print(f"⚠️  Notion API error: {str(e)}")
            return None
            
        except Exception as e:
            print(f"⚠️  Failed to fetch task: {str(e)}")
            return None
    
    def update_task(self, task_id: str, updates: Dict) -> bool:
        """
        Update task properties
        
        Args:
            task_id: ID of the task to update
            updates: Dictionary of properties to update
                Example: {"status": "completed", "priority": "high"}
                
        Returns:
            bool: True if update was successful, False otherwise
        """
        if self.mock_mode:
            return self._mock_update_task(task_id, updates)
            
        try:
            properties = {}
            
            # Map updates to Notion properties
            if "status" in updates:
                status = updates["status"].lower()
                status_mapping = {
                    "pending": STATUS_OPTIONS["PENDING"],
                    "completed": STATUS_OPTIONS["COMPLETED"],
                    "missed": STATUS_OPTIONS["MISSED"],
                    "in_progress": STATUS_OPTIONS["IN_PROGRESS"]
                }
                properties[PROPERTIES["STATUS"]] = {
                    "select": {"name": status_mapping.get(status, status)}
                }
                
            if "priority" in updates:
                priority = updates["priority"].lower()
                priority_mapping = {
                    "low": PRIORITY_OPTIONS["LOW"],
                    "medium": PRIORITY_OPTIONS["MEDIUM"],
                    "high": PRIORITY_OPTIONS["HIGH"]
                }
                properties[PROPERTIES["PRIORITY"]] = {
                    "select": {"name": priority_mapping.get(priority, priority)}
                }
                
            if "deadline" in updates:
                properties[PROPERTIES["DEADLINE"]] = {
                    "date": {"start": updates["deadline"]}
                }
                
            if "description" in updates:
                properties[PROPERTIES["DESCRIPTION"]] = {
                    "rich_text": [{"text": {"content": updates["description"]}}]
                }
            
            # Always update last_updated
            properties[PROPERTIES["LAST_UPDATED"]] = {
                "date": {"start": get_current_time()}
            }
            
            self.client.pages.update(
                page_id=task_id,
                properties=properties
            )
            
            print(f"✓ Task {task_id} updated successfully")
            return True
            
        except APIResponseError as e:
            if e.code == APIErrorCode.ObjectNotFound:
                print(f"⚠️  Task with ID {task_id} not found.")
            else:
                print(f"⚠️  Notion API error: {str(e)}")
            return False
            
        except Exception as e:
            print(f"⚠️  Failed to update task: {str(e)}")
            return False
    
    def mark_overdue_tasks(self) -> int:
        """Mark tasks past deadline as Missed"""
        if self.mock_mode:
            return self._mock_mark_overdue()
        
        try:
            pending_tasks = self.get_pending_tasks()
            now = datetime.now()
            marked_count = 0
            
            for task in pending_tasks:
                if task["deadline"]:
                    deadline = datetime.fromisoformat(task["deadline"].replace('Z', '+00:00'))
                    if deadline < now:
                        self.update_task_status(task["id"], "Missed")
                        marked_count += 1
            
            return marked_count
        except Exception as e:
            print(f"⚠️  Error marking overdue tasks: {str(e)}")
            return 0
    
    # Mock mode methods for demo safety
    def _mock_create_task(self, task_name: str, deadline: Optional[str] = None,
                         priority: str = "Medium", description: str = "") -> Dict:
        """Mock implementation for testing"""
        task = {
            "id": f"mock-{len(self.mock_tasks) + 1}",
            "task_name": task_name,
            "status": STATUS_OPTIONS["PENDING"],
            "priority": priority.capitalize(),
            "deadline": deadline,
            "created_at": get_current_time(),
            "last_updated": get_current_time(),
            "description": description,
            "url": "#"
        }
        self.mock_tasks.append(task)
        return task
    
    def _mock_update_task(self, task_id: str, updates: Dict) -> bool:
        """Mock implementation for updating task"""
        for task in self.mock_tasks:
            if task["id"] == task_id:
                for key, value in updates.items():
                    if key in task:
                        task[key] = value
                task["last_updated"] = get_current_time()
                return True
        return False
        
    def _mock_update_status(self, task_id: str, status: str) -> bool:
        """Mock implementation for updating status"""
        return self._mock_update_task(task_id, {"status": status})
    
    def _mock_mark_overdue(self) -> int:
        """Mark overdue tasks in mock mode"""
        now = datetime.now()
        marked = 0
        for task in self.mock_tasks:
            if task["status"] == "Pending" and task["deadline"]:
                deadline = datetime.fromisoformat(task["deadline"].replace('Z', '+00:00'))
                if deadline < now:
                    task["status"] = "Missed"
                    marked += 1
        return marked
