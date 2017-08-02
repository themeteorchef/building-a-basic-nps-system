import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

const Scores = new Mongo.Collection('Scores');

Scores.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Scores.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const ScoresSchema = new SimpleSchema({
  userId: {
    type: String,
    label: 'The ID of the user that submitted this score.',
  },
  name: {
    type: String,
    label: 'The name of the user that submitted this score.',
    autoValue() { // eslint-disable-line
      if (this.isInsert) {
        const userId = this.field('userId').value;
        const user = Meteor.users.findOne(userId, { fields: { profile: 1 } });
        return user && user.profile ? `${user.profile.name.first} ${user.profile.name.last}` : 'Unknown Customer';
      }
    },
  },
  createdAt: {
    type: String,
    label: 'The date this score was submitted.',
    autoValue() { // eslint-disable-line
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  score: {
    type: Number,
    min: 0,
    max: 10,
    label: 'The score the user submitted.',
  },
  additionalFeedback: {
    type: String,
    label: 'Additional feedback submitted with this score.',
    optional: true,
  },
});

Scores.attachSchema(ScoresSchema);

export default Scores;
