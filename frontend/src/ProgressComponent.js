import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function ProgressComponent({ val, maxVal }) {
  const circleWidth = 200; // Control the size of the circle
  const strokeWidth = 10; // Control the thickness of the path
  const percentage = val / maxVal * 100; // Calculate the percentage completion

  return (
      <div style={{ width: circleWidth, height: circleWidth }}>
          <CircularProgressbar
              value={val}
              maxValue={maxVal}  // Corrected property name here
              text={`${val} / ${maxVal}`} // Show rounded percentage
              styles={buildStyles({
                  // Customize the path, text, and trail (optional)
                  pathColor: `rgba(62, 152, 199, ${70 / 100})`,
                  textColor: '#f88',
                  trailColor: '#d6d6d6',
                  backgroundColor: '#3e98c7',
                  pathTransitionDuration: 2, // Animation time in seconds
                  strokeWidth: strokeWidth, // Set the thickness of the path
              })}
          />
      </div>
  );
}


export default ProgressComponent;
