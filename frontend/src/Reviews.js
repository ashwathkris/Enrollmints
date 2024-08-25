import React, { useState } from 'react';
import axios from 'axios';
import './Reviews.css';

function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [searchProfessor, setSearchProfessor] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [sortOrder, setSortOrder] = useState('DESC');

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reviews`, {
        params: { professor: searchProfessor, course: searchCourse, sort: sortOrder }
      });
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      fetchReviews();
    }
  };

  return (
    <div className="review-list-container">
      <input
        type="text"
        placeholder="Search by Professor Name"
        value={searchProfessor}
        onChange={e => setSearchProfessor(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <input
        type="text"
        placeholder="Search by Course Code"
        value={searchCourse}
        onChange={e => setSearchCourse(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={() =>
        {setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC');
        fetchReviews();}}>
        Sort by Rating {sortOrder === 'DESC' ? 'Asc' : 'Desc'}
      </button>
      <ul>
        {reviews.map(review => (
          <li key={review.Review_ID}>
            <h2>{review.Course_Code} - {review.ProfessorName}</h2>
            <p>{review.Review}</p>
            <p>Rating: {review.Rating}</p>
            {review.WebLink && <a href={review.WebLink}>More Info</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewList;
