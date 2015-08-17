




/************************* Content Script Messaging Handler *************************/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{

	if(request.message === "onPageLoad")
	{
		waitUntilPageLoaded();
		// User is watching the current video, so we store it
		storeVideoId();
		// Now we have to modify the contents of the related videos
		changeRelatedVideos();
	}
	else if (request.message === "removeVideos")
	{
		removeRelatedVideosSeenBefore(request.prevVideos);
	}
	else
	{
		console.log("Extension Error: Unrecognized command request");
	}
});


/************************* DOM Interactions *************************/
function waitUntilPageLoaded()
{
	var found = false;
	while(!found)
	{
		var relatedVideos = $('.related-list-item');
		if(relatedVideos != null)
		{
			found = true;
		}
	}
}

function getChannelId()
{
	// We get the specific link of the channel the current video is on
	var channelId = $("div.yt-user-info a.yt-uix-sessionlink.spf-link.g-hovercard").attr("href").replace("/channel/", "");
	return channelId;
}

function getRelatedVideos()
{
	return $(".related-list-item");
}

function getRelatedPlaylists()
{
	return getRelatedVideos().has('.related-playlist');
}

function getRelatedRecommendedVideos()
{
	return getRelatedVideos().has('span:contains("Recommended for you")');
}

function removeRelatedVideos()
{
	getRelatedVideos().remove();
}

function removeUnneededPlaylists()
{
	getRelatedPlaylists().remove();
}

function removeUnneededRecommendedVideos()
{
	getRelatedRecommendedVideos().remove();
}

function removeShowMoreButton()
{
	$("#watch-more-related").remove();
	$("#watch-more-related-button").remove();
}

function changeRelatedVideos()
{
	removeUnneededPlaylists();
	removeUnneededRecommendedVideos();
	removeShowMoreButton();

	var allRelatedVideos = getRelatedVideos();

	var relatedVideoIds = [];
	$.each(allRelatedVideos, function(i, item) {
		var id = $(item).find('.content-link.spf-link.yt-uix-sessionlink').attr('href').replace("/watch?v=", "");
		relatedVideoIds.push(id);
	});

	chrome.runtime.sendMessage({message: "getVideoIdsToRemove", videoIds: relatedVideoIds});
}

function removeRelatedVideosSeenBefore(videosSeenBefore)
{
	var allRelatedVideos = getRelatedVideos();

	$.each(allRelatedVideos, function(i, item) {
		var id = $(item).find('.content-link.spf-link.yt-uix-sessionlink').attr('href').replace("/watch?v=", "");
		if ($.inArray(id, videosSeenBefore) !== -1)
		{
			item.remove();
		}
	});
}

/************************* Storage Functions *************************/
function storeVideoId()
{
	chrome.runtime.sendMessage({message: "storeVideoId"});
}