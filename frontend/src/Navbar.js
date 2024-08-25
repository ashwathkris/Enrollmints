import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    const paths = location.pathname.split('/');
    const netId = paths[2];  // Assuming netId is the second segment in the URL, adjust as needed.
    //const { netId } = useParams();

    const navStyle = {
        backgroundColor: '#f0f0f0',
        padding: '20px',
    };

    const linkStyle = {
        color: 'black',
        textDecoration: 'none',
    };

    const activeLinkStyle = {
        color: 'blue',
    };

    return (
        <nav style={navStyle}>
            <ul style={{ listStyleType: "none", display: "flex", justifyContent: "space-around", margin: 0 }}>
                <li>
                    <NavLink to={`/dashboard/${netId}`} style={linkStyle} activeStyle={activeLinkStyle}>
                        Dashboard
                    </NavLink>
                </li>
                <li>    
                    <NavLink to={`/suggest_courses/${netId}`} style={linkStyle} activeStyle={activeLinkStyle}>
                        Suggestions
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/courselist/${netId}`} style={linkStyle} activeStyle={activeLinkStyle}>
                        Course List
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/reviews/${netId}`} style={linkStyle} activeStyle={activeLinkStyle}>
                        Reviews
                    </NavLink>
                </li>
                <li>
                    <NavLink to={`/registration/${netId}`} style={linkStyle} activeStyle={activeLinkStyle}>
                        Course Registration
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navbar;
