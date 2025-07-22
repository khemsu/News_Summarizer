import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './pages/Navbar';
import Feature from './pages/Feature';
import Contact from './components/Contact';
import TextSummarize from './components/TextSummarize';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="summarize" element={<Feature/>}/>
        <Route path="text-summarize" element={<TextSummarize />} />
        <Route path="/contact" element={<Contact/>} />
      </Routes>
    </Router>
  );
}

export default App
