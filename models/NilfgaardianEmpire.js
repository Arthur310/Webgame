var bookshelf = require('./../config/db').bookshelf;
bookshelf.plugin('registry'); 

var NilfgaardianEmpire = bookshelf.Model.extend({
  tableName: 'nilfgaardianempire',  
  idAttribute: 'NilfID'
});

module.exports = {
   NilfgaardianEmpire: NilfgaardianEmpire
};

