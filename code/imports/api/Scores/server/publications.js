import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import Scores from '../Scores';

Meteor.publish('scores', () =>
  Scores.find(
    { createdAt: { $gte: moment().subtract(30, 'days').utc().format() } },
    { sort: { createdAt: -1 } },
  ),
);
