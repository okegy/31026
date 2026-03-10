import os
import json
import asyncio
import re

DB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "local_db")
os.makedirs(DB_DIR, exist_ok=True)

class MockCursor:
    def __init__(self, items):
        self.items = items
        
    def __aiter__(self):
        self.iter = iter(self.items)
        return self
        
    async def __anext__(self):
        try:
            return next(self.iter)
        except StopIteration:
            raise StopAsyncIteration

    async def to_list(self, length=None):
        return self.items[:length] if length is not None else self.items
        
    def __iter__(self):
        return iter(self.items)

class UpdateResult:
    def __init__(self, modified_count):
        self.modified_count = modified_count

class LocalJSONCollection:
    def __init__(self, name):
        self.name = name
        self.file_path = os.path.join(DB_DIR, f"{name}.json")
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w') as f:
                json.dump([], f)

    def _read(self):
        try:
            if not os.path.exists(self.file_path):
                return []
            with open(self.file_path, 'r') as f:
                return json.load(f)
        except Exception:
            return []

    def _write(self, data):
        with open(self.file_path, 'w') as f:
            json.dump(data, f, indent=2)

    def _match(self, item, query):
        if not query: return True
        for k, v in query.items():
            if isinstance(v, dict) and "$regex" in v:
                if not re.search(v["$regex"], str(item.get(k, ""))):
                    return False
            else:
                if item.get(k) != v:
                    return False
        return True

    async def insert_many(self, docs):
        data = self._read()
        data.extend(docs)
        self._write(data)

    async def insert_one(self, doc):
        data = self._read()
        data.append(doc)
        self._write(data)
        doc["_id"] = "mock_id" # mimic mongo
        return doc

    async def delete_many(self, query):
        data = self._read()
        new_data = [item for item in data if not self._match(item, query)]
        # Return how many deleted
        self._write(new_data)

    async def delete_one(self, query):
        data = self._read()
        removed = 0
        new_data = []
        for item in data:
            if removed == 0 and self._match(item, query):
                removed = 1
                continue
            new_data.append(item)
        self._write(new_data)

    def find(self, query=None, projection=None):
        data = self._read()
        results = [item for item in data if self._match(item, query or {})]
        return MockCursor(results)

    async def find_one(self, query, projection=None):
        data = self._read()
        for item in data:
            if self._match(item, query):
                return item
        return None

    async def update_one(self, query, update):
        data = self._read()
        modified = 0
        for item in data:
            if self._match(item, query):
                if "$set" in update:
                    item.update(update["$set"])
                modified = 1
                break
        self._write(data)
        return UpdateResult(modified)

# Export our "Collections"
patients_collection = LocalJSONCollection("patients")
doctors_collection = LocalJSONCollection("doctors")
appointments_collection = LocalJSONCollection("appointments")
waitlist_collection = LocalJSONCollection("waitlist")
logs_collection = LocalJSONCollection("system_logs")
symptom_reports_collection = LocalJSONCollection("symptom_reports")
