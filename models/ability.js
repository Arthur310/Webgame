var bookshelf = require('./../config/db').bookshelf;
bookshelf.plugin('registry'); 

var Ability = bookshelf.Model.extend({
  tableName: 'ability',
  idAttribute: 'ID'
});

module.exports = {
   Ability: Ability   
};

