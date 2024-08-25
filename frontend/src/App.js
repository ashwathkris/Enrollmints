import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './UserContext'; // import the UserProvider
import CourseList from './CourseList';
import CourseDetail from './CourseDetail';
import Login from './Login';
import Navbar from './Navbar';
import CourseTables from './CourseTables';
import CourseRegistration from './CourseRegistration';
import ReviewList from './Reviews';
import CourseDashboard from './CourseDashboard';

const App = () => {
  return (
    <UserProvider> {/* Wrap components within UserProvider */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/courselist/:netId" element={<CourseList />} />
          <Route path="/suggest_courses/:netId" element={<CourseTables />} />
          <Route path="/registration/:netId" element={<CourseRegistration />} />
          <Route path="/reviews/:netId" element={<ReviewList />} />
          <Route path="/dashboard/:netId" element={<CourseDashboard />} />
          <Route path="/courses/:courseCode" element={<CourseDetail />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
