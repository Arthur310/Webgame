var bookshelf = require('./../config/db').bookshelf;
bookshelf.plugin('registry'); 

var NorthernRealms = bookshelf.Model.extend({
  tableName: 'northernrealms',  
  idAttribute: 'NorthID'
});

module.exports = {
   NorthernRealms: NorthernRealms   
};

