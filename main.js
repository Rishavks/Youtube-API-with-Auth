// Options
const CLIENT_ID = '63735373449-deojqi69pmsur9rt9suq6mqrgo47mbl8.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'Gigguk';

// Form submit and change channel
channelForm.addEventListener('submit', e => {
    e.preventDefault();

    const channel = channelInput.value;
    getChannel(channel);
})

// Load auth2 lib 
function handleClientLoad(){
    gapi.load('client:auth2', initClient);
}

// Init API client lib and set up sign in instance
function initClient(){
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(() => {
        // Listen for sign in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle initial sign in State
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;

    });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn){
    if(isSignedIn){
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';
    }
}

// Handle login
function handleAuthClick(){
    gapi.auth2.getAuthInstance().signIn();
}

// Handle login
function handleSignoutClick(){
    gapi.auth2.getAuthInstance().signOut();
}

// Display Channel Data
function showChannelData(data){
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

// Get Channel from api
function getChannel(channel){
    gapi.client.youtube.channels.list({
        "part": [
            "snippet,contentDetails,statistics"
          ],
          "forUsername": channel
    })
    .then(response => {
        console.log(response);
        const channel = response.result.items[0];

        const output = `
        <ul class="collection">
            <li class="collection-item">Title: ${channel.snippet.title}</li>
            <li class="collection-item">ID: ${channel.id}</li>
            <li class="collection-item">Subscribers: ${channel.statistics.subscriberCount}</li>
            <li class="collection-item">Views: ${channel.statistics.viewCount}</li>
            <li class="collection-item">Videos: ${channel.statistics.videoCount}</li>
        </ul>
        <p>${channel.snippet.description}</p>
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
        `;

        showChannelData(output);

        const playlistId = channel.contentDetails.relatedPlaylists.uploads;
        requestVideoPlaylist(playlistId);
    })
    .catch(err => alert('No Channel By That Name'));
}

// 
function requestVideoPlaylist(playlistId){
    const requestOptions = {
        playlistId: playlistId,
        part: ["snippet"],
        maxResults: 12
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(response => {
        console.log(response);
        const playListItems = response.result.items;
        if(playListItems){
            let output = '<br><h4 class="center-align">Latest Videos</h4>';

            // Loop through videos and append output
            playListItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;

                output += `
                <div class="col s3">
                <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                </div>
                `;
            });

            // Output Video
            videoContainer.innerHTML = output;
        } else {
            videoContainer.innerHTML = 'No uploaded videos...';
        }
    });
}

//https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=SEARCH_QUERY&type=video&key=AIzaSyBPpUsj97xkpn0ad4vXo4fQ8-i-BwP0qTg
