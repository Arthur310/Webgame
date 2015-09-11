var bookshelf = require('./../config/db').bookshelf;
bookshelf.plugin('registry'); 

var User = bookshelf.Model.extend({
  tableName: 'users',
  idAttribute: 'ID'
});

module.exports = {
   User: User
};
