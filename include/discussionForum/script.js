let selectChannelDropDown = document.getElementById("channel");

// Add change event listener
let currentChannel = selectChannelDropDown.value;
selectChannelDropDown.addEventListener("change", function () {
    currentChannel = selectChannelDropDown.value;
    console.log(currentChannel);
});


let currentURL = new URL(window.location.href);
let searchBox = document.getElementById("search");
let page = 1;
async function fetchNewPost(channel, searchTerms, page) {
    return new Promise((resolve, reject) => {
        let fetchParams = {
            channel: channel,
            searchTerms: searchTerms,
            page: page
        };

        //let fetchURL = "/api/discuss.php?" + new URLSearchParams(fetchParams);
        let fetchURL = "/debug/discussionForum.json?" + new URLSearchParams(fetchParams);

        $.ajax({
            url: fetchURL,
            type: "GET",
            dataType: "json",
            success: function (data) {
                resolve(data);  // Resolve the promise with the data
            },
            error: function (error) {
                console.error(error);
                reject(error);  // Reject the promise with the error
            }
        });
    });
}

//Get the post list container
let postListContainer = document.getElementById("postListContainer");

async function updatePost() {
    try {
        // Assuming fetchNewPost is an asynchronous function that returns the post list
        let serverResult = await fetchNewPost(currentChannel, searchBox.value, page);
        // Clear existing content
        let postList = serverResult.returnedPost;
        console.log(postList);
        // Loop through each post and append to the postListContainer
        postList.forEach(post => {
            // Create elements for the post
            let postDiv = document.createElement('div');
            postDiv.classList.add('card', 'mb-2');

            let cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'p-2', 'p-sm-3');

            let mediaItem = document.createElement('div');
            mediaItem.classList.add('media', 'forum-item');

            let mediaBody = document.createElement('div');
            mediaBody.classList.add('media-body');
            let postTitle = document.createElement('h6');
            let postLink = document.createElement('a');
            postLink.href = '#';
            postLink.dataset.targetPost = post.postID;  // Set the post id as a data attribute
            postLink.dataset.toggle = 'collapse';
            postLink.dataset.target = '.forum-content';
            postLink.classList.add('text-body');
            postLink.textContent = post.postTitle;

            let postContent = document.createElement('p');
            postContent.classList.add('text-secondary');
            postContent.textContent = post.postContentPreview;

            let postInfo = document.createElement('p');
            postInfo.classList.add('text-muted');

            let postAuthorLink = document.createElement('a');
            postAuthorLink.href = 'javascript:void(0)';
            postAuthorLink.textContent = post.postAuthor;

            let replyInfo = document.createElement('span');
            replyInfo.classList.add('text-secondary', 'font-weight-bold');
            replyInfo.textContent = ` replied ${post.lastReplyTime} ago`;

            // Append elements
            postTitle.appendChild(postLink);
            postInfo.appendChild(postAuthorLink);
            postInfo.appendChild(document.createTextNode(' replied '));
            postInfo.appendChild(replyInfo);

            mediaBody.appendChild(postTitle);
            mediaBody.appendChild(postContent);
            mediaBody.appendChild(postInfo);

            mediaItem.appendChild(mediaBody);

            // Additional spans for Vote, Reply, View
            let voteSpan = document.createElement('span');
            voteSpan.textContent = `Vote: ${post.votes}`;

            let replySpan = document.createElement('span');
            replySpan.textContent = `Reply: ${post.comments}`;

            let viewSpan = document.createElement('span');
            viewSpan.textContent = `View: ${post.views}`;

            mediaItem.appendChild(voteSpan);
            mediaItem.appendChild(replySpan);
            mediaItem.appendChild(viewSpan);

            cardBody.appendChild(mediaItem);
            postDiv.appendChild(cardBody);

            postListContainer.appendChild(postDiv);
        });
        let postLinks = postListContainer.querySelectorAll('a[data-target-post]');
        console.log(postLinks);
        postLinks.forEach(link => {
            link.addEventListener('click', linkClickHandler);
        });        
    } catch (error) {
        // Handle errors
        console.error('Error updating posts:', error);
    }
}

// Call the updatePost function to initiate the request
updatePost();

// Assuming loadPostDetail is a function that takes a post ID as a parameter
function loadPostDetail(postID) {
    //Get the post from remote server
    //let fetchURL = "/api/discuss.php?postID=" + postID;
    let fetchURL = "/debug/postInfo.json?postID=" + postID;
    $.ajax({
        url: fetchURL,
        type: "GET",
        dataType: "json",
        success: function (data) {
            console.log(data);
            // Assuming the post detail is returned in the data object
            // Call the function to display the post detail
            displayPostDetail(data);
        },
        error: function (error) {
            console.error(error);
        }
    });
}

// Event listener function
function linkClickHandler(event) {
    event.preventDefault(); // Prevent the default behavior of the link
    const postID = event.target.dataset.targetPost; // Get the post ID from the data attribute
    loadPostDetail(postID); // Call the loadPostDetail function with the postID
}

let postContentContainer = document.getElementById("postContent");

function displayPostDetail(post) {
    // Clear existing content
    postContentContainer.innerHTML = '';

    // Create post title
    let postTitle = document.createElement('h2');
    postTitle.textContent = post.postTitle;
    postContentContainer.appendChild(postTitle);

    // Loop through each content item and create corresponding HTML structure
    post.content.forEach(contentItem => {
        let contentDiv = document.createElement('div');
        contentDiv.classList.add('card', 'mb-2');

        let cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        let mediaItem = document.createElement('div');
        mediaItem.classList.add('media', 'forum-item');

        let mediaBody = document.createElement('div');
        mediaBody.classList.add('media-body', 'ml-3');

        // Author and Date
        let authorLink = document.createElement('a');
        authorLink.href = 'javascript:void(0)';
        authorLink.classList.add('text-secondary');
        authorLink.textContent = contentItem.postAuthor;

        let dateSmall = document.createElement('small');
        dateSmall.classList.add('text-muted', 'ml-2');
        dateSmall.textContent = contentItem.postDate;

        // Post Title
        let contentTitle = document.createElement('h5');
        contentTitle.classList.add('mt-1');
        contentTitle.textContent = contentItem.postTitle;

        // Post Content
        let contentText = document.createElement('div');
        contentText.classList.add('mt-3', 'font-size-sm');
        let contentParagraph = document.createElement('p');
        contentParagraph.textContent = contentItem.postContent;
        contentText.appendChild(contentParagraph);

        // Votes and Actions
        let actionsDiv = document.createElement('div');
        let voteSpan = document.createElement('span');
        voteSpan.textContent = `Vote: ${contentItem.votes}`;

        let replyLink = document.createElement('a');
        replyLink.href = 'javascript:void(0)';
        replyLink.classList.add('text-muted', 'small');
        replyLink.textContent = 'Reply';

        let upvoteLink = document.createElement('a');
        upvoteLink.href = 'javascript:void(0)';
        upvoteLink.classList.add('text-muted', 'small');
        upvoteLink.textContent = 'Upvote';

        let downvoteLink = document.createElement('a');
        downvoteLink.href = 'javascript:void(0)';
        downvoteLink.classList.add('text-muted', 'small');
        downvoteLink.textContent = 'Downvote';

        let reportLink = document.createElement('a');
        reportLink.href = 'javascript:void(0)';
        reportLink.classList.add('text-muted', 'small');
        reportLink.textContent = 'Report inappropriate';

        // Append elements
        mediaBody.appendChild(authorLink);
        mediaBody.appendChild(dateSmall);
        mediaBody.appendChild(contentTitle);
        mediaBody.appendChild(contentText);

        actionsDiv.appendChild(voteSpan);
        actionsDiv.appendChild(replyLink);
        actionsDiv.appendChild(upvoteLink);
        actionsDiv.appendChild(downvoteLink);
        actionsDiv.appendChild(reportLink);

        mediaItem.appendChild(mediaBody);
        mediaItem.appendChild(actionsDiv);

        cardBody.appendChild(mediaItem);
        contentDiv.appendChild(cardBody);

        // Append contentDiv to postContentContainer
        postContentContainer.appendChild(contentDiv);
    });
}