import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './CourseDetail.css'; // Import CSS file for styling

const CourseDetail = () => {
  const { courseCode } = useParams();
  const [courseDetails, setCourseDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/courses/${courseCode}`);
        const data = await response.json();

        // Convert timedelta objects to strings
        const updatedData = { ...data };
        for (const key in updatedData) {
          if (Object.prototype.hasOwnProperty.call(updatedData, key)) {
            if (updatedData[key] instanceof Object && updatedData[key].hasOwnProperty('days')) {
              // Convert timedelta object to string
              updatedData[key] = updatedData[key].days + ' days';
            }
          }
        }

        setCourseDetails(updatedData);
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    fetchData();
  }, [courseCode]);

  if (!courseDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div className="course-detail-container">
      <h1>Course Details for {courseCode.replace(/_/g, ' ')}</h1>
      <div className="course-detail">
        {Object.entries(courseDetails).map(([key, value]) => (
          <div key={key} className="detail-row">
            <span className="detail-key">{key.replace(/_/g, ' ')}</span>: <span className="detail-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;
