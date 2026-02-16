import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-content">
          <h1 className="home-heading">
            Collaborate on tasks <br />in <span className="home-accent">real-time</span>
          </h1>
          <p className="home-subheading">
            Create boards, organize tasks, drag and drop across lists,
            and see updates from your team instantly.
          </p>
          <div className="home-cta">
            <Link to="/signup" className="btn btn-primary home-btn">
              Get Started Free
            </Link>
            <Link to="/login" className="btn btn-secondary home-btn">
              Login
            </Link>
          </div>
          <div className="home-features">
            <div className="home-feature">
              <span>📋</span>
              <div>
                <h3>Boards & Lists</h3>
                <p>Organize work visually</p>
              </div>
            </div>
            <div className="home-feature">
              <span>🔄</span>
              <div>
                <h3>Real-time Sync</h3>
                <p>See changes instantly</p>
              </div>
            </div>
            <div className="home-feature">
              <span>👥</span>
              <div>
                <h3>Team Collaboration</h3>
                <p>Assign & track tasks</p>
              </div>
            </div>
            <div className="home-feature">
              <span>🖱️</span>
              <div>
                <h3>Drag & Drop</h3>
                <p>Move tasks effortlessly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;