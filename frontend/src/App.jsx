import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Matches from './pages/Matches';
import Listings from './pages/Listings';
import Profile from './pages/Profile';
import VerificationCallback from './pages/VerificationCallback';
import VerifyEmail from './pages/VerifyEmail';
import Chats from './pages/Chats';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verification/callback" element={<VerificationCallback />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
