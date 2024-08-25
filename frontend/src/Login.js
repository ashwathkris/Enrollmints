import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import CSS file for styling

function Login() {
    const [netId, setNetId] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/login?netId=${netId}`);
            const data = await response.json();
            console.log(data);
            //alert('Login successful! Check console for details.');
            if (data) {
                navigate(`/courselist/${netId}`); // Redirect to CourseList with netId in URL
            } else {
                throw new Error('Login failed, please check credentials');
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed!');
        }
    };

    return (
        <div className="login-container"> {/* Added a class for styling */}
            <form onSubmit={handleSubmit}>
                <label>
                    <input
                        type="text"
                        value={netId}
                        onChange={(e) => setNetId(e.target.value)}
                        placeholder="Enter NetID"
                    />
                </label>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
