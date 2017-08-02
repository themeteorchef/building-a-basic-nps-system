import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, Button } from 'react-bootstrap';
import moment from 'moment';
import { timeago, monthDayYear } from '@cleverbeagle/dates';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { createContainer } from 'meteor/react-meteor-data';
import _ from 'lodash';
import ScoresCollection from '../../../api/Scores/Scores';
import Icon from '../../components/Icon/Icon';
import Loading from '../../components/Loading/Loading';

import './Scores.scss';

class Scores extends React.Component {
  handleRequestScores() {
    if (confirm('Are you sure? This will immediately send an email to all users.')) {
      Meteor.call('scores.requestFeedback', (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Requests sent!', 'success');
        }
      });
    }
  }

  render() {
    const {
      loading,
      responses,
      reportingWindow,
      npsScore,
      promoters,
      passives,
      detractors,
      scores,
    } = this.props;

    return (!loading ? (<div className="Scores">
      <Row>
        <Col xs={12} sm={4} md={3} lg={2}>
          <nav>
            <Button bsStyle="success" onClick={this.handleRequestScores} block>
              Request Scores
            </Button>
          </nav>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={3}>
          <Panel header="30-day NPS®" className="thirty-day-nps">
            <h1>{npsScore || 0}</h1>
          </Panel>
        </Col>
        <Col xs={12} lg={9}>
          <Panel header="Score Distribution" className="score-distribution">
            <div className="distributions">
              <div className="promoter" style={{ width: `${promoters}%` }}><Icon icon="smile-o" /></div>
              <div className="passive" style={{ width: `${passives}%` }}><Icon icon="meh-o" /></div>
              <div className="detractor" style={{ width: `${detractors}%` }}><Icon icon="frown-o" /></div>
            </div>
          </Panel>
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <h4 className="page-header">{responses} since {reportingWindow}</h4>
          <div className="scores">
            {scores.map(({ _id, type, score, name, createdAt, additionalFeedback }) => (
              <Panel key={_id} className={`score ${type}`}>
                <Icon icon={{ promoter: 'smile-o', passive: 'meh-o', detractor: 'frown-o' }[type]} />
                <header className="clearfix">
                  <strong className="pull-left">{name} <span>{score}/10</span></strong>
                  <p className="pull-right">{timeago(createdAt)}</p>
                </header>
                {additionalFeedback ? <div className="additional-feedback">
                  <p>{additionalFeedback}</p>
                </div> : ''}
              </Panel>
            ))}
          </div>
        </Col>
      </Row>
    </div>) : <Loading />);
  }
}

Scores.propTypes = {
  loading: PropTypes.bool.isRequired,
  responses: PropTypes.string.isRequired,
  reportingWindow: PropTypes.string.isRequired,
  npsScore: PropTypes.number.isRequired,
  promoters: PropTypes.number.isRequired,
  passives: PropTypes.number.isRequired,
  detractors: PropTypes.number.isRequired,
  scores: PropTypes.array.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('scores');
  const scores = ScoresCollection.find({}, { sort: { createdAt: -1 } }).fetch();
  const total = ScoresCollection.find().count();
  const promoters = (ScoresCollection.find({ score: { $gt: 8 } }).count() / total) * 100;
  const passives = (ScoresCollection.find({ score: { $gt: 6, $lt: 9 } }).count() / total) * 100;
  const detractors = (ScoresCollection.find({ score: { $gte: 0, $lt: 7 } }).count() / total) * 100;

  return {
    loading: !subscription.ready(),
    responses: `${total} ${total === 1 ? 'response' : 'responses'}`,
    reportingWindow: `${monthDayYear(moment().subtract(30, 'days').utc().format())}`,
    npsScore: Math.floor(promoters - detractors),
    promoters,
    passives,
    detractors,
    scores: _.map(scores, (response) => {
      const { score } = response;
      if (score > 8) response.type = 'promoter';
      if (score > 6 && score < 9) response.type = 'passive';
      if (score >= 0 && score < 7) response.type = 'detractor';
      return response;
    }),
  };
}, Scores);
