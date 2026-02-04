import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import auth from './auth/auth'
import Home from './Home'
import { useEffect, useState } from 'react'
import Analytics from './analytics/Analytics'
import Navbar from './Navbar'
import type { User } from 'oidc-client-ts'

function App() {
    const [statusMessage, setStatusMessage] = useState("")
    const [user, setUser] = useState<User | null>(null)

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
            <Navbar user={user} />

            <div className="content">
                {
                    statusMessage.length > 0 &&
                    <div>{statusMessage}</div>
                }

                <Routes>
                    <Route path="/" element={<Home updateStatusMessage={updateStatusMessage} user={user} setUser={setUser} />} />
                    <Route path="/analytics" element={<Analytics updateStatusMessage={updateStatusMessage} />} />
                    <Route path="/openid/callback/" element={<auth.LoginCallback updateStatusMessage={updateStatusMessage} />} />
                </Routes>
            </div>
        </BrowserRouter>
  )
}

export default App
