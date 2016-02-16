import React from 'react';

class HelpAndTutorials extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-xs-12 ">
          <div className="wrapper-header">
            <h2>Help & Tutorials</h2>
          </div>
          <div className="product-card-full no-highlight">
            <h3>PDF Tutorials</h3>

            <p><a href="https://d2e48ltfsb5exy.cloudfront.net/content_mj/files/PRM+Admin+-+Quickly+add+a+User.pdf">Quickly add a user</a></p>
            <p><a href="https://d2e48ltfsb5exy.cloudfront.net/content_mj/files/My.jobsUserGuide-UserManagement.pdf">General overview</a></p>

            <h3>Video Overview</h3>

            <div className="video-embed-container">
              <iframe src="https://player.vimeo.com/video/155433118" frameBorder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HelpAndTutorials;