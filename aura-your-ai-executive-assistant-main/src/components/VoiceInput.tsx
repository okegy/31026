import { useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useToast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onStart?: () => void;
  onStop?: () => void;
  autoSubmit?: boolean;
  className?: string;
}

export const VoiceInput = ({ 
  onTranscript, 
  onStart, 
  onStop,
  autoSubmit = false,
  className = '' 
}: VoiceInputProps) => {
  const { toast } = useToast();
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  } = useVoiceInput({
    continuous: false,
    interimResults: true,
    lang: 'en-US'
  });

  // Handle transcript changes
  useEffect(() => {
    if (transcript && !isListening && autoSubmit) {
      onTranscript(transcript.trim());
      resetTranscript();
    }
  }, [transcript, isListening, autoSubmit, onTranscript, resetTranscript]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Voice Input Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleClick = () => {
    if (isListening) {
      stopListening();
      if (onStop) onStop();
      
      // Submit transcript when stopping
      setTimeout(() => {
        if (transcript && transcript.trim()) {
          onTranscript(transcript.trim());
          resetTranscript();
        }
      }, 100);
    } else {
      resetTranscript();
      if (onStart) onStart();
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={className}
        title="Voice input not supported in this browser"
      >
        <MicOff className="h-4 w-4 text-muted-foreground" />
      </Button>
    );
  }

  return (
    <Button
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      onClick={handleClick}
      className={`${className} ${isListening ? 'animate-pulse' : ''}`}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
};
