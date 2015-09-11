var bookshelf = require('./../config/db').bookshelf;
var NorthernRealmsModel = require('./../models/NorthernRealms');
var NilfgaardianEmpireModel = require('./../models/NilfgaardianEmpire');
var AbilityModel = require('./../models/ability');
var game_server = module.exports = {};

game_server.faction = function(client, socketio) {
	var factionID;
	var factionName;
	var bottoml = [];
	var bottomr = [];
	var temp = [];
	
	if (client.data == 'Northern Realms') {
		factionID = 'NorthID';
		factionName = 'northernrealms';
	} else if (client.data == 'Nilfgaardian Empire') {
		factionID = 'NilfID';
		factionName = 'nilfgaardianempire';
	}
	
	bookshelf.knex.select(factionID).from("gwent." + client.id).then(function(rows){			
		for	(var index = 0; index < rows.length; index++) {
			temp[index] = JSON.stringify(rows[index]);
			temp[index] = temp[index].replace(/["{:}]/g, "");
			temp[index] = temp[index].replace(factionID, "");
		};
		
		bookshelf.knex.select().from("gwent." + factionName).whereNotIn(factionID,temp).then(function(rowsl){
			for	(var index = 0; index < rowsl.length; index++) {
				bottoml[index] = rowsl[index];			
			}
			
			bookshelf.knex.select().from("gwent." + factionName).whereIn(factionID,temp).then(function(rowsr){
				for	(var index = 0; index < rowsr.length; index++) {
					bottomr[index] = rowsr[index];
				}	
				socketio.emit('faction' + client.id, {llist: bottoml, rlist: bottomr, faction: client.data});			
			}).catch(function(error) {
				console.error(error)
			});	
		}).catch(function(error) {
			console.error(error)
		});	
	}).catch(function(error) {
		console.error(error)
	});
};
	
game_server.deck = function(client, socketio) {
	var array = client.deck.slice();
	bookshelf.knex.select('ID').from(client.id).where('ID', '=', 1).then(function(rows){
		if (client.data == 'Northern Realms') {
			bookshelf.knex(client.id).where('ID', '>=', 1).update({
				NorthID: null
			}).catch(function(error) {
				console.error(error)
			});
			
			for (var index = 0; index < array.length; index++) {
				if (index == 0) {
					bookshelf.knex(client.id).where('ID', '=', index + 1).update({
						NorthID: client.maincard
					}).catch(function(error) {
						console.error(error)
					});
				} else {
					bookshelf.knex(client.id).where('ID', '=', index + 1).update({
						NorthID: array[index].NorthID
					}).catch(function(error) {
						console.error(error)
					});
				}
			};
		} else if (client.data == 'Nilfgaardian Empire') {
			bookshelf.knex(client.id).where('ID', '>=', 1).update({
				NilfID: null
			}).catch(function(error) {
				console.error(error)
			});
			
			for (var index = 0; index < array.length; index++) {
				if (index == 0) {
					bookshelf.knex(client.id).where('ID', '=', index + 1).update({				
						NilfID: client.maincard
					}).catch(function(error) {
						console.error(error)
					});
				} else {
					bookshelf.knex(client.id).where('ID', '=', index + 1).update({				
						NilfID: array[index].NilfID
					}).catch(function(error) {
						console.error(error)
					});
				}
			};
		};	
	}).catch(function(error) {
		for (var index = 0; index < 50; index++)
			bookshelf.knex(client.id).insert({ID: index + 1, NorthID: null, NilfID: null}).catch(function(error) {
			console.error(error)
		});	
	});

	
};