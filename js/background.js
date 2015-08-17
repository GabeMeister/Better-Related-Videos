var queryInfo = {
	active: true
}

/*
Handle Messages from Content Scripts
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.message === "storeVideoId")
	{
		chrome.tabs.query({'active': true}, function (tabs) {
			var url = tabs[0].url;
			var videoId = getParameterByName('v', url);

			// The key matters, but the value doesn't matter for now, so it's just blank
			localStorage.setItem(videoId, "");
		});
	}
	else if (request.message === "getVideoIdsToRemove")
	{
		var videosSeenBefore = getVideoIdsToRemove(request.videoIds);
		chrome.tabs.query(queryInfo, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {message: "removeVideos", prevVideos: videosSeenBefore});
		});
	}
	else
	{
		// SOMETHING WENT WRONG
		console.log("MESSAGE UNRECOGNIZED IN BACKGROUND SCRIPT");
	}

});



var recentDate = new Date();
chrome.webNavigation.onHistoryStateUpdated.addListener(function() {
	var currDate = new Date();

	// To ensure the user isn't clicking too fast through videos
	if(Math.abs(currDate - recentDate) >= 1000)
	{
		recentDate = currDate;
		
		setTimeout(function() {
			chrome.tabs.query(queryInfo, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {"message": "onPageLoad"});
			});
		}, 1000);
		
	}

	

});


function getParameterByName(paramName, url) {
    paramName = paramName.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + paramName + "=([^&#]*)"),
        results = regex.exec(url);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getVideoIdsToRemove(videoIdList)
{
	var videosSeenBefore = [];
	$.each(videoIdList, function(i, id) {
		var item = localStorage.getItem(id);

		// item is a "" if previously seen by user
		if (item === "")
		{
			videosSeenBefore.push(id);
		}
	});

	return videosSeenBefore;
}