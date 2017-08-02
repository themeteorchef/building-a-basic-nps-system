import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, Button } from 'react-bootstrap';
import qs from 'qs';
import { createContainer } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';

import './AdditionalFeedback.scss';

class AdditionalFeedback extends React.Component {
  constructor(props) {
    super(props);
    this.state = { scoreId: null };
    this.handleLogAdditionalFeedback = this.handleLogAdditionalFeedback.bind(this);
    this.handleLogScore = this.handleLogScore.bind(this);
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleLogScore();
    }, 1000);
  }

  handleLogAdditionalFeedback(event) {
    event.preventDefault();
    const { scoreId } = this.state;

    Meteor.call('scores.submitFeedback', {
      scoreId,
      additionalFeedback: this.feedback.value,
    }, (error) => {
      if (error) {
        Bert.alert(error.message, 'danger');
      } else {
        this.setState({ feedbackRecorded: true });
      }
    });
  }

  handleLogScore() {
    const { score, userId } = this.props;

    Meteor.call('scores.log', { score, userId }, (error, scoreId) => {
      if (error) {
        Bert.alert(error.message, 'danger');
      } else {
        this.setState({ scoreId });
      }
    });
  }

  render() {
    const { score } = this.props;
    return (<div className="AdditionalFeedback">
      <Row>
        <Col xs={12} sm={6} smOffset={3}>
          {!this.state.feedbackRecorded ? <form onSubmit={this.handleLogAdditionalFeedback}>
            <h4>Can you tell us more about why you chose {score}?</h4>
            <FormGroup>
              <textarea
                ref={(feedback) => { this.feedback = feedback; }}
                className="form-control"
              />
            </FormGroup>
            <Button type="submit" bsStyle="success" block>Submit Feedback</Button>
          </form> : <h4>Hey, thanks! Your feedback is a big help.</h4>}
        </Col>
      </Row>
    </div>);
  }
}

AdditionalFeedback.defaultProps = {
  score: 0,
};

AdditionalFeedback.propTypes = {
  score: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
};

export default createContainer(() => {
  const queryParams = qs.parse(location.search.replace('?', ''));
  return {
    score: parseInt(queryParams.score, 10),
    userId: queryParams.userId,
  };
}, AdditionalFeedback);
