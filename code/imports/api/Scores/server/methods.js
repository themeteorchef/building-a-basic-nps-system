import moment from 'moment';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Email } from 'meteor/email';
import Scores from '../Scores';
import rateLimit from '../../../modules/rate-limit';
import getPrivateFile from '../../../modules/server/get-private-file';
import templateToHTML from '../../../modules/server/template-to-html';

Meteor.methods({
  'scores.log': function scoresLog(response) {
    check(response, {
      score: Number,
      userId: String,
    });

    try {
      const recentScore = Scores.findOne({
        userId: response.userId,
        createdAt: {
          $gte: moment().subtract(30, 'days').utc().format(),
        },
      });

      if (recentScore) {
        Scores.update(recentScore._id, { $set: { score: response.score } });
        return recentScore._id;
      }

      return Scores.insert(response);
    } catch (exception) {
      throw new Meteor.Error('500', exception.message);
    }
  },
  'scores.submitFeedback': function scoresSubmitFeedback(feedback) {
    check(feedback, {
      scoreId: String,
      additionalFeedback: String,
    });

    try {
      const { scoreId, additionalFeedback } = feedback;
      return Scores.update(scoreId, { $set: { additionalFeedback } });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
  'scores.requestFeedback': function scoresRequestFeedback() {
    try {
      const users = Meteor.users.find({ roles: { $in: ['user'] } }).fetch();
      users.forEach(({ _id, emails }) => {
        Meteor.defer(() => {
          Email.send({
            to: emails[0].address,
            from: 'customers@themeteorchef.com',
            subject: 'How likely are you to refer The Meteor Chef to a friend?',
            html: templateToHTML(getPrivateFile('email-templates/nps.html'), {
              applicationName: 'The Meteor Chef',
              url: Meteor.absoluteUrl(),
              userId: _id,
            }),
          });
        });
      });
    } catch (exception) {
      throw new Meteor.Error('500', exception);
    }
  },
});

rateLimit({
  methods: [
    'scores.log',
    'scores.submitFeedback',
    'scores.requestFeedback',
  ],
  limit: 5,
  timeRange: 1000,
});
