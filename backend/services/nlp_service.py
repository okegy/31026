import os
import openai
from dotenv import load_dotenv

load_dotenv()

class NLPProcessor:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if self.api_key:
            openai.api_key = self.api_key

    async def analyze_symptoms(self, text: str):
        """Analyze symptoms from text or transcript using AI."""
        if not self.api_key:
            # Fallback mock analysis
            return {
                "symptoms": ["general malaise"],
                "urgency": "low",
                "recommended_speciality": "General Medicine"
            }
            
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Analyze the following patient symptom description. Extract symptoms, urgency (low/medium/high), and recommended medical speciality."},
                    {"role": "user", "content": text}
                ]
            )
            # Simple parse (in real case use structured output)
            content = response.choices[0].message.content
            return {"raw_analysis": content, "urgency": "medium", "recommended_speciality": "General Medicine"}
        except Exception as e:
            print(f"AI Analysis Error: {e}")
            return {"error": "AI service unavailable", "urgency": "medium"}

    async def parse_appointment_intent(self, text: str):
        """Parse appointment intent, date, and time from natural language."""
        if not self.api_key:
            # Mock parse
            return {
                "intent": "book",
                "date": "2026-03-15",
                "time": "14:30",
                "doctor_id": "d1"
            }
            
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Extract booking intent, date (YYYY-MM-DD), time (HH:MM), and doctor ID from user request. Return JSON."},
                    {"role": "user", "content": text}
                ]
            )
            import json
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"AI Intent Parse Error: {e}")
            return {"intent": "unknown"}

nlp_processor = NLPProcessor()
