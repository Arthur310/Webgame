var bookshelf = require('./../config/db').bookshelf;
bookshelf.plugin('registry'); 

var Sessions = bookshelf.Model.extend({
  tableName: 'sessions',
  idAttribute: 'session_id'
});

module.exports = {
   Sessions: Sessions   
};

