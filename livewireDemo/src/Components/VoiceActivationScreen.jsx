import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import Axios
import heyLiveWireMp3 from '../assets/audio/heyLiveWire.mp3'; // Import the audio file
import currentCharging from '../assets/audio/current_charging.mp3'; // Import the charging audio file

export default function VoiceActivationScreen() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [audio] = useState(new Audio(heyLiveWireMp3)); // Create an Audio instance
  const [chargeAudio] = useState(new Audio(currentCharging));
  const [apiResponse, setApiResponse] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Browser doesn't support speech recognition.");
      return;
    }

    const speechRecognition = new window.webkitSpeechRecognition();
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;

    speechRecognition.onstart = () => {
      console.log('Speech recognition started');
      setListening(true);
    };

    speechRecognition.onend = () => {
      console.log('Speech recognition stopped');
      setListening(false);
    };

    speechRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    speechRecognition.onresult = async (event) => {
      console.log('Speech recognition result received');
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPiece = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptPiece;
        } else {
          interimTranscript += transcriptPiece;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
        
        // Check for keywords and play corresponding audio
        if (finalTranscript.toLowerCase().includes('hey')) {
          audio.play(); // Play the audio file
        } else if (finalTranscript.toLowerCase().includes('charging')) {
          chargeAudio.play(); // Play the charging audio file
        }

        // Send the final transcript to the API
        try {
          const response = await axios.post('http://localhost:8000/api', {
            message: finalTranscript
          });
          setApiResponse(response.data.response); // Update state with API response
        } catch (error) {
          console.error('Error sending data to API:', error);
        }
      }

      setInterimTranscript(interimTranscript);
    };

    setRecognition(speechRecognition);
  }, [audio, chargeAudio]);

  const startListening = () => {
    if (recognition) {
      console.log('Starting to listen...');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      console.log('Stopping listening...');
      recognition.stop();
    }
  };

  const resetTranscript = () => {
    console.log('Resetting transcript...');
    setTranscript('');
    setInterimTranscript('');
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={startListening}>Start</button>
      <button onClick={stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <button onClick={() => speakText(transcript)}>Speak Transcript</button>
      <button onClick={() => speakText(interimTranscript)}>Speak Interim Transcript</button>
      <p>{transcript}</p>
      <p>{interimTranscript}</p>
      <p>API Response: {apiResponse}</p>
    </div>
  );
}
