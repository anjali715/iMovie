import React, { useState, useRef } from 'react';
import './App.css'; // Import the CSS file

const App = () => {
  const [audioTracks, setAudioTracks] = useState([]);
  const audioRef = useRef(null);
  const [draggedTrackId, setDraggedTrackId] = useState(null);

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const addAudioTrackFromFile = (file) => {
    if (!file) return;

    const newTrack = {
      id: audioTracks.length + 1,
      title: file.name,
      duration: '', // Remove default duration
      url: URL.createObjectURL(file)
    };

    setAudioTracks([...audioTracks, newTrack]);
  };

  const addAudioTrack = (title, url) => {
    const newTrack = {
      id: audioTracks.length + 1,
      title: title,
      duration: '', // Remove default duration
      url: url
    };
    setAudioTracks([...audioTracks, newTrack]);
  };

  const deleteAudioTrack = (id) => {
    const updatedTracks = audioTracks.filter(track => track.id !== id);
    setAudioTracks(updatedTracks);
  };

  const playAudioTrack = (url) => {
    audioRef.current.src = url;
    audioRef.current.play();
  };

  const playAllAudioTracks = () => {
    let index = 0;
  
    const playNextTrack = () => {
      if (index < audioTracks.length) {
        const track = audioTracks[index];
        playAudioTrack(track.url);
        index++;
      }
    };
  
    audioRef.current.addEventListener('ended', playNextTrack);
  
    // Start playing the first track
    playNextTrack();
  };
  
  const handleDragStart = (trackId) => {
    setDraggedTrackId(trackId);
  };

  const handleDrop = (droppedTrackId) => {
    if (draggedTrackId === droppedTrackId) {
      return;
    }

    const draggedTrackIndex = audioTracks.findIndex(track => track.id === draggedTrackId);
    const droppedTrackIndex = audioTracks.findIndex(track => track.id === droppedTrackId);
    const updatedTracks = [...audioTracks];
    const [draggedTrack] = updatedTracks.splice(draggedTrackIndex, 1);
    updatedTracks.splice(droppedTrackIndex, 0, draggedTrack);

    setAudioTracks(updatedTracks);
    setDraggedTrackId(null);
  };

  const handleDragOver = (e, trackId) => {
    e.preventDefault();
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support recording audio.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      let chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setRecording(true);

      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        setRecording(false);
      }, 5000); // Record for 5 seconds
    } catch (error) {
      console.error('Error recording audio:', error);
    }
  };

  const handleSaveAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const title = 'Recorded Audio';
      addAudioTrack(title, url);
      setAudioBlob(null);
    }
  };

  return (
    <div className="App">
      <h1 className="title">iMovie - Lite</h1>
      <div className="audio-tracks">
        {audioTracks.map((track) => (
          <div
            key={track.id}
            className="audio-track"
            draggable
            onDragStart={() => handleDragStart(track.id)}
            onDragOver={(e) => handleDragOver(e, track.id)}
            onDrop={() => handleDrop(track.id)}
          >
            <div className="track-info">
              <p>{track.title}</p>
              {/* Remove default duration */}
            </div>
            <button className="delete-button" onClick={() => deleteAudioTrack(track.id)}>Delete</button>
            <button className="play-button" onClick={() => playAudioTrack(track.url)}>Play</button>
          </div>
        ))}
      </div>
      <input type="file" accept="audio/*" onChange={(event) => addAudioTrackFromFile(event.target.files[0])} />
      <button onClick={startRecording} disabled={recording}>Start Recording</button>
      <button onClick={handleSaveAudio} disabled={!audioBlob}>Save Recorded Audio</button>
      <button onClick={playAllAudioTracks}>Play All</button>
      <audio ref={audioRef} controls />
    </div>
  );
}

export default App;
