import React, { useState, useEffect } from 'react';
import './CourseTables.css';  // Make sure to create this CSS file in your project
import { useParams } from 'react-router-dom';


function CourseTables() {
    const { netId } = useParams();
    const [data, setData] = useState({
        suggestedBreadthCourses: [],
        suggestedAdvancedCourses: [],
        takenAdvancedCourses: [],
        takenBreadths: []
    });

    useEffect(() => {
        fetch(`http://localhost:5000/suggest_courses/${netId}`) // Adjust API endpoint as necessary
            .then(response => response.json())
            .then(data => {
                setData({
                    suggestedBreadthCourses: data.suggested_breadth_courses,
                    suggestedAdvancedCourses: data.suggested_advanced_courses,
                    takenAdvancedCourses: data.taken_advanced_courses,
                    takenBreadths: data.taken_breadths.map(breadth => ({ Breadth: breadth }))
                });
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [netId]);

    const renderTable = (courses, title) => (
        <div className="table-container">
            <h2>{title}</h2>
            <table>
                <thead>
                    <tr>
                        {courses.length > 0 && Object.keys(courses[0]).map(key => (
                            <th key={key}>{key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr key={index}>
                            {Object.values(course).map((value, i) => (
                                <td key={i}>{value || 'N/A'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="content">
            {renderTable(data.takenBreadths, 'Taken Breadths')}
            {renderTable(data.takenAdvancedCourses, 'Taken Advanced Courses')}
            {renderTable(data.suggestedBreadthCourses, 'Suggested Breadth Courses')}
            {renderTable(data.suggestedAdvancedCourses, 'Suggested Advanced Courses')}
        </div>
    );
}

export default CourseTables;
