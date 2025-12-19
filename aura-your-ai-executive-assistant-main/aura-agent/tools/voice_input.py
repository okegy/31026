"""
Voice Input Tool for AURA
Provides speech-to-text functionality using multiple APIs
"""
import os
from typing import Optional

try:
    import speech_recognition as sr
    SPEECH_RECOGNITION_AVAILABLE = True
except ImportError:
    SPEECH_RECOGNITION_AVAILABLE = False
    print("⚠️  SpeechRecognition not installed. Run: pip install SpeechRecognition pyaudio")


class VoiceInput:
    """Voice input handler with multiple speech recognition backends"""
    
    def __init__(self):
        """Initialize voice input with available recognizer"""
        self.available = SPEECH_RECOGNITION_AVAILABLE
        
        if self.available:
            self.recognizer = sr.Recognizer()
            self.microphone = None
            try:
                self.microphone = sr.Microphone()
                print("✓ Voice input initialized (Microphone detected)")
            except Exception as e:
                print(f"⚠️  Microphone not available: {str(e)}")
                self.available = False
        else:
            print("⚠️  Voice input not available")
    
    def listen(self, timeout: int = 5, phrase_time_limit: int = 10) -> Optional[str]:
        """
        Listen for voice input and convert to text
        
        Args:
            timeout: Seconds to wait for speech to start
            phrase_time_limit: Maximum seconds for the phrase
            
        Returns:
            Transcribed text or None if failed
        """
        if not self.available or not self.microphone:
            print("❌ Voice input not available")
            return None
        
        try:
            print("\n🎤 Listening... (speak now)")
            
            with self.microphone as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
                
                # Listen for audio
                audio = self.recognizer.listen(
                    source, 
                    timeout=timeout,
                    phrase_time_limit=phrase_time_limit
                )
            
            print("🔄 Processing speech...")
            
            # Try Google Speech Recognition (free)
            try:
                text = self.recognizer.recognize_google(audio)
                print(f"✓ Recognized: '{text}'")
                return text
            except sr.UnknownValueError:
                print("❌ Could not understand audio")
                return None
            except sr.RequestError as e:
                print(f"⚠️  Google Speech Recognition error: {e}")
                
                # Fallback to Sphinx (offline)
                try:
                    text = self.recognizer.recognize_sphinx(audio)
                    print(f"✓ Recognized (offline): '{text}'")
                    return text
                except Exception as sphinx_error:
                    print(f"❌ Offline recognition also failed: {sphinx_error}")
                    return None
                    
        except sr.WaitTimeoutError:
            print("⏱️  No speech detected (timeout)")
            return None
        except Exception as e:
            print(f"❌ Voice input error: {str(e)}")
            return None
    
    def listen_continuous(self, callback, stop_phrase: str = "stop listening"):
        """
        Continuous listening mode
        
        Args:
            callback: Function to call with recognized text
            stop_phrase: Phrase to stop listening
        """
        if not self.available or not self.microphone:
            print("❌ Voice input not available")
            return
        
        print(f"\n🎤 Continuous listening mode (say '{stop_phrase}' to stop)")
        
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=0.5)
            
            while True:
                try:
                    print("\n🎤 Listening...")
                    audio = self.recognizer.listen(source, timeout=30, phrase_time_limit=10)
                    
                    try:
                        text = self.recognizer.recognize_google(audio)
                        print(f"✓ Recognized: '{text}'")
                        
                        if stop_phrase.lower() in text.lower():
                            print("🛑 Stopping continuous listening")
                            break
                        
                        callback(text)
                        
                    except sr.UnknownValueError:
                        print("❌ Could not understand audio")
                    except sr.RequestError as e:
                        print(f"⚠️  Recognition error: {e}")
                        
                except sr.WaitTimeoutError:
                    print("⏱️  No speech detected")
                except KeyboardInterrupt:
                    print("\n🛑 Stopped by user")
                    break
                except Exception as e:
                    print(f"❌ Error: {str(e)}")
                    break
    
    def test_microphone(self) -> bool:
        """Test if microphone is working"""
        if not self.available or not self.microphone:
            return False
        
        try:
            print("\n🎤 Testing microphone... Say something!")
            with self.microphone as source:
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=5)
                text = self.recognizer.recognize_google(audio)
                print(f"✓ Microphone working! Heard: '{text}'")
                return True
        except Exception as e:
            print(f"❌ Microphone test failed: {str(e)}")
            return False


# Convenience function
def get_voice_input(timeout: int = 5) -> Optional[str]:
    """Quick function to get voice input"""
    voice = VoiceInput()
    return voice.listen(timeout=timeout)


if __name__ == "__main__":
    # Test voice input
    print("="*60)
    print("🎤 AURA Voice Input Test")
    print("="*60)
    
    voice = VoiceInput()
    
    if voice.available:
        print("\nTesting microphone...")
        voice.test_microphone()
        
        print("\n\nNow testing command recognition...")
        print("Try saying: 'Remind me to buy groceries tomorrow'")
        
        text = voice.listen(timeout=10)
        if text:
            print(f"\n✅ Successfully captured: '{text}'")
            print("This text would be sent to AURA's NLP system")
        else:
            print("\n❌ No input captured")
    else:
        print("\n❌ Voice input not available on this system")
