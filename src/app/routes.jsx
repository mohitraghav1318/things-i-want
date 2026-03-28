import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'

const Notepad = lazy(() => import('../tools/notepad/index.jsx'))
const Draw = lazy(() => import('../tools/draw/index.jsx'))
const UrlShort = lazy(() => import('../tools/url-shortner/index.jsx'))
const LiveImage = lazy(() => import('../tools/live-image/index.jsx'))
const VoiceRoom = lazy(() => import('../tools/voice-room/index.jsx'))

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notepad" element={<Notepad />} />
            <Route path="/draw" element={<Draw />} />
            <Route path="/url-shortner" element={<UrlShort />} />
            <Route path="/live-image" element={<LiveImage />} />
            <Route path="/voice-room" element={<VoiceRoom />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}