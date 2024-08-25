import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [filter500, setFilter500] = useState(false);
  const [filterSpring2024, setFilterSpring2024] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerSearch, setTriggerSearch] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter500) params.append('courseCode', '5');
    if (filterSpring2024) params.append('semester', 'Spring 2024');
    if (searchTerm) params.append('searchQuery', searchTerm);

    fetch(`http://localhost:5000/courses?${params.toString()}`)
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching data', error));

    if (triggerSearch) {
      setTriggerSearch(false);
    }
  }, [filter500, filterSpring2024, searchTerm, triggerSearch]);

  const getUniqueCourses = () => {
    const unique = new Map();
    courses.forEach(course => {
      if (!unique.has(course.Course_Code)) {
        unique.set(course.Course_Code, course.Course_Name);
      }
    });
    return Array.from(unique, ([code, name]) => ({ Course_Code: code, Course_Name: name }));
  };

  return (
    <div className="App">
      <h1>Course List</h1>
      <div className="layout">
        <div className="filter-sidebar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setTriggerSearch(true);
              }
            }}
            className="search-bar"
          />
          <label>
            <input
              type="checkbox"
              checked={filter500}
              onChange={(e) => setFilter500(e.target.checked)}
            />
            Courses starting with 500
          </label>
          <label>
            <input
              type="checkbox"
              checked={filterSpring2024}
              onChange={(e) => setFilterSpring2024(e.target.checked)}
            />
            Courses in Spring 2024
          </label>
        </div>
        <div className="course-grid">
          {getUniqueCourses().map(course => (
            <Link to={`/courses/${course.Course_Code.replace(/ /g, '_')}`} key={course.Course_Code} className="course-card">
              <h2>{course.Course_Code}</h2>
              <p>{course.Course_Name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseList;
