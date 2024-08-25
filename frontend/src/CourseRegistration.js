import React, { useState } from 'react';
import './CourseRegistration.css'; // Import CSS file for styling
import { useParams } from 'react-router-dom';

function CourseRegistration() {
    const { netId } = useParams();
    const [fields, setFields] = useState([{ value: '' }]);

    const handleDelete = async (event) => {
        event.preventDefault();
        const values = [...fields];
        const deletedCourse = values.splice(1)[0].value;
        setFields(values);
        try {
            const response = await fetch(`http://localhost:5000/registration/${netId}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course: deletedCourse })
            });
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                alert('Course deleted successfully');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete course');
            }
        } catch (error) {
            console.error('Deletion failed:', error);
            alert('Deletion failed: ' + error.message);
        }
    };

    const handleChange = (index, event) => {
        const values = [...fields];
        values[index].value = event.target.value;
        setFields(values);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/registration/${netId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ course: fields[0].value })  // Send the first field's value as course
            });
            if (response.ok) {
                const result = await response.json();
                console.log(result);
                alert('Course registered successfully');
                setFields([{ value: '' }]);  // Reset fields on successful registration
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to register course');
            }
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed: ' + error.message);
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <form onSubmit={handleSubmit}>
                {fields.map((field, index) => (
                    <div key={index} className="field-wrapper">
                        <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleChange(index, e)}
                            placeholder="Enter course"
                            className='input-field'
                        />
                    </div>
                ))}
                <button onClick={(e) => handleDelete(e)}>Delete</button>
                <button onClick={handleSubmit}>Add Course</button>
                </form>
            </div>
        </div>
    );
}

export default CourseRegistration;
