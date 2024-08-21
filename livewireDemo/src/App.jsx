import { useState } from 'react'
import './App.css'
import VoiceActivationScreen from './Components/VoiceActivationScreen'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
  <VoiceActivationScreen />
    </>
  )
}

export default App
