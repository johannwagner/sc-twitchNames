let _modPath;
let _twitchNameList;
let _usedNameList;

let _twitchLimit;
let _offset;
let _settings;

let loadNewTwitchNames = () => {

	// jhovgaards ChannelId
	// 67159698


	$.ajax({
	    url: 'https://api.twitch.tv/kraken/channels/67159698/follows?limit=' + _twitchLimit + '&offset=' + (_offset * _twitchLimit),
		    headers: {
		    	'Accept': 'application/vnd.twitchtv.v5+json', 
				'Client-ID': 'i4f3iw16lwbyv2hou66v4a8lrjwovw'
	    },
	    success: (followerJSON) => {
	    	console.log(followerJSON);
	    	let newTwitchNames = _.map(followerJSON['follows'], (follower) => {
	    		return follower['user']['name'];
	    	});

	    	console.log('TwitchNames: Fetched new names');
	    	console.log(newTwitchNames);

	    	let unusedTwitchNames = _.filter(newTwitchNames, (twitchName) => {
	    		return !_twitchNameList.includes(twitchName) && !_usedNameList.includes(twitchName)
	    	})

	    	console.log('TwitchNames: Removed used and already known names.');
	    	console.log(unusedTwitchNames);

	    	_settings.twitchNames.twitchNameList = _twitchNameList = _.concat(_twitchNameList, unusedTwitchNames);
	    	console.log('TwitchNames: Available Names:');
	    	console.log(_twitchNameList);
	    },
	    error: (xhr, error) => {
	    	console.error('TwitchNames: Something went wrong.');
	    	console.error(xhr);
	    	console.error(error);
	    },
	    async: false
	});

	_offset++;


}

exports.initialize = (modPath) =>{
	_modPath = modPath;
	_twitchLimit = 25;
	_offset = 0;


	Generators.GenerateEmployeeNative = Generators.GenerateEmployee;
	Generators.GenerateEmployee = (gender, employeeTypeName, settings, level) => {

		let generatedEmployee = Generators.GenerateEmployeeNative(gender, employeeTypeName, settings, level);


		while(_twitchNameList.length <= 0){
			// We need more names. Twitch does not allow to get more names than 100 (25 names per default).
			loadNewTwitchNames();
			console.log('TwitchNames: Load new Names from Twitch servers.')
		}

		let accessId = _.random(_twitchNameList.length - 1);
		let usedName = _twitchNameList[accessId];

		_usedNameList.push(usedName);
		_.remove(_twitchNameList, (name) => name === usedName);

		console.log('TwitchNames: Used Names ' + _usedNameList.length);

		generatedEmployee.name = usedName;

		return generatedEmployee;




	}
};




exports.onLoadGame = settings => {

	_settings = settings;


	if(!settings.twitchNames) {
		settings.twitchNames = {};
	}

	let settingsObj = settings.twitchNames;

	if(!settingsObj.knownMod) {
		// If there are no settings, knownMod will be undefined and falsy.
		settingsObj.knownMod = true;
		console.log('TwitchNames: Try to send mail.')
		GetRootScope().sendMail('TupperBox', 'New Mod: TwitchNames', 'Hey, \n I just hacked this mod together. Please let me know on GitHub, if there are errors or bad behaviours of this mod. \n\n I hope, you have a good time. \n Regards, \n Johann');
	
		_twitchNameList = [];
		_usedNameList = [];
		_offset = 0;

		settingsObj.twitchNameList = _twitchNameList;
		settingsObj.usedNameList = _usedNameList;
		settingsObj.offset = _offset;
	} else {

		_twitchNameList = settingsObj.twitchNameList;
		_usedNameList = settingsObj.usedNameList;
		_offset = settingsObj.offset;
	}


};
exports.onNewHour = settings => {};
exports.onNewDay = settings => {};

