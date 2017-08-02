import handlebars from 'handlebars';
import juice from 'juice';

export default (handlebarsMarkup, context = {}) => {
  if (handlebarsMarkup && context) {
    const template = handlebars.compile(handlebarsMarkup);
    return juice(template(context));
  }

  throw new Error('Please pass Handlebars markup to compile and an optional context object with data mapping to the Handlebars expressions used in your template.');
};
