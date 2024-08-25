import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import ProgressComponent from './ProgressComponent';
import { useParams } from 'react-router-dom';


function CourseDashboard() {
  const { netId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/dashboard/${netId}`);
        setCourseData(response.data);
        setLoading(false);
      } catch (err) {
        setError(`Failed to fetch data: ${err.message}`);
        setLoading(false);
      }
    };

    fetchData();
  }, [netId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!courseData) return <p>No data found</p>;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px' }}>
      <div>
        <h2>Courses Taken</h2>
        {Object.keys(courseData).filter(key => key.includes("20")).map(semester => (
          <div key={semester}>
            <h3>{semester}</h3>
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {courseData[semester].map(course => (
                  <tr key={course.Course_Code}>
                    <td>{course.Course_Name}</td>
                    <td>{course.Course_Code}</td>
                    <td>{course.Credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ width: 250, height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{padding: 10}}>Credits</p>
          <ProgressComponent title="Credits" val={courseData.credits_completed} maxVal={courseData.credit_requirement} />
          </div>
          <div style={{ width: 250, height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{padding: 10}}>Breadths</p>
          <ProgressComponent title="Breadths" val={courseData.breadths_completed} maxVal={courseData.breadth_requirement} />
          </div>
          <div style={{ width: 250, height: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{padding: 10}}>Advanced Courses</p>
          <ProgressComponent title="Depths" val={courseData.depths_completed} maxVal={courseData.depth_requirement} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDashboard;
