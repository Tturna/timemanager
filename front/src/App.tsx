import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import auth from './auth/auth'
import Home from './Home'
import { useEffect, useState } from 'react'

function App() {
    const [statusMessage, setStatusMessage] = useState("")

    const updateStatusMessage = (message: string) => {
        let newMessage = message;

        if (statusMessage.length > 0) {
            newMessage = statusMessage + "\n" + message
        }

        setStatusMessage(newMessage)
    }

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setStatusMessage("")
        }, 10_000)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [statusMessage])

    return (
        <BrowserRouter>
            {
                statusMessage.length > 0 &&
                <div>{statusMessage}</div>
            }

            <Routes>
                <Route path="/" element={<Home updateStatusMessage={updateStatusMessage} />} />
                <Route path="/openid/callback/" element={<auth.LoginCallback updateStatusMessage={updateStatusMessage} />} />
            </Routes>
        </BrowserRouter>
  )
}

export default App
