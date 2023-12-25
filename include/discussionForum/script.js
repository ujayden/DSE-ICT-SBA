let selectChannelDropDown = document.getElementById("channel");

// Add change event listener
let currentChannel = selectChannelDropDown.value;
selectChannelDropDown.addEventListener("change", function () {
    currentChannel = selectChannelDropDown.value;
    console.log(currentChannel);
});

let alertPopup = document.getElementById("postAlert");
let alertContainer = document.getElementById("postAlertContent");

/**
 * 
 * @param {string} message // The message to be displayed in the alert
 * @param {string} alertHeader // The alert header type
 */
function updateAlert(message, alertHeader) {
    alertPopup.classList.add("show");
    alertContainer.innerHTML = `
        <strong>${alertHeader}</strong>${message}
    `;
    setTimeout(function () {
        alertPopup.classList.remove("show");
    }, 5000);
}

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

if (typeof marked == 'undefined' && typeof DOMPurify == 'undefined') {
    throw new Error('Mark.js and DOMPurify not available, check if the script is loaded');
}
/**
 * Converts raw content to markdown using marked library and sanitizes it.
 * @param {string} toMarkdown - The text to be converted to markdown
 * @returns {string} - Sanitized markdown text
 */
function generateMarkdownText(toMarkdown) {
    let markdownText = marked.parse(toMarkdown);
    markdownText = DOMPurify.sanitize(markdownText);
    return markdownText;
}

let titleInput = document.getElementById('newPostTitle');
let contentTextarea = document.getElementById('newPostContent');
let tagsInput = document.getElementById('newPostTags');
let postContainer = document.getElementById('previewContent');
let previewModal = document.getElementById('previewModal');


/**
 * Generates a post preview and optionally displays it in a Bootstrap modal.
 * @param {string} title - Title obtained from the title input
 * @param {string} rawContent - Raw content obtained from the textarea
 * @param {string} tag - Tag obtained from the tag input
 * @param {string} currentChannel - Current channel obtained from the channel dropdown
 * @param {HTMLElement} targetContainer - The container to append the post to
 * @param {HTMLElement} targetPopUpElem - The Bootstrap modal to show the preview, if false, no preview will be shown
 */
function generatePreview(title, rawContent, tag, currentChannel, targetContainer, targetPopUpElem) {
    // Create the preview container
    let previewContainer = document.createElement('div');
    previewContainer.classList.add('preview-post');

    // Generate markdown text
    let markdownText = generateMarkdownText(rawContent);
    
    //Make title and tag to html characters to prevent XSS - he.js
    title = he.encode(title);
    tag = he.encode(tag);


    // Fill the preview container with post details
    previewContainer.innerHTML = `
        <h2>${title}</h2>
        <p><strong>Channel:</strong> ${currentChannel}</p>
        <div>${markdownText}</div>
        <p><strong>${tag}</strong></p>
    `;

    // Append the preview to the target container
    targetContainer.innerHTML = '';
    targetContainer.appendChild(previewContainer);

    // Display the preview in the Bootstrap modal if provided
    if (targetPopUpElem) {
        // Update the content of the modal body with the generated preview
        let modalBody = targetPopUpElem.querySelector('.modal-body');
        modalBody.innerHTML = '';
        modalBody.appendChild(previewContainer);

        // Show the modal
        new bootstrap.Modal(targetPopUpElem).show();
    }
}

previewBtn.addEventListener('click', function (event) {
    event.preventDefault();
    generatePreview(
        titleInput.value,
        contentTextarea.value,
        tagsInput.value,
        selectChannelDropDown.value,
        postContainer,
        previewModal
    );
});

function convertToHashtags() {
    if (tagsInput) {
        let textContent = tagsInput.value;
        if (textContent.match(/#\s+/)) {
            tagsInput.value = textContent.replace(/#\s+/, '#');
            return false;
        }
        // Also prevent ## from being entered
        if (textContent.match(/##/)) {
            tagsInput.value = textContent.replace(/##/, '#');
            return false;
        }
        let words = textContent.split(/\s+/); // Use a regex to split by any whitespace
        let hashtags = words.map(word => word.startsWith('#') ? word : '#' + word);
        tagsInput.value = hashtags.join(' ');
    }
}

tagsInput.addEventListener('input', convertToHashtags);

let addAttachmentBtn = document.getElementById('addAttachmentBtn');

addAttachmentBtn.addEventListener('click', function() {
    handleAttachment();
});

let attachmentList = document.getElementById('attachmentContainer');

let newPostFiles = [];

function handleAttachment() {
    // Clear the list
    attachmentList.innerHTML = '';
    newPostFiles = [];

    // Open the file dialog
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.zip, .rar, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation, image/*, video/*, .svg, text/html, text/css, application/javascript';
    fileInput.click();

    // List the files selected
    fileInput.addEventListener('change', function (event) {
        let files = event.target.files;
        let totalSize = 0;

        // Maximum file size is 8MB, and up to 3 files are allowed
        for (let i = 0; i < files.length; i++) {
            let file = files[i];

            // Check file size
            if (file.size > 8 * 1024 * 1024) {
                alert('File size exceeds the maximum limit of 8MB.');
                continue;
            }

            // Check the number of files
            if (i >= 3) {
                alert('You can select up to 3 files.');
                break;
            }

            let fileItem = document.createElement('div');
            fileItem.classList.add('file-item');

            let fileName = document.createElement('span');
            fileName.classList.add('file-name');
            fileName.textContent = file.name;

            let fileSize = document.createElement('span');
            fileSize.classList.add('file-size');
            fileSize.textContent = ` ${(file.size / (1024 * 1024)).toFixed(2)} MB`;

            fileItem.appendChild(fileName);
            fileItem.appendChild(fileSize);

            attachmentList.appendChild(fileItem);

            totalSize += file.size;

            // Push the selected file to the array
            newPostFiles.push(file);
            console.log('Processing Files:', newPostFiles);

        }

        console.log('Selected Files:', newPostFiles);
        console.log('Total Size:', totalSize, 'bytes');
    });
}

let resetBtn = document.getElementById('cleanBtn');
let newPostForm = document.getElementById('newPostForm');
resetBtn.addEventListener('click', function() {
    // Reset the form
    newPostForm.reset();
});


//Handle the form submission
newPostForm.addEventListener('submit', function(event) {
    handleSubmission(event);
}
);
let originURL = new URL(window.location.href).origin;
function handleSubmission(event) {
    event.preventDefault();

    // Get form data as JSON
    let filesTrackerUUID = crypto.randomUUID();
    let formData = {
        mode: 'newPost',
        title: $('#newPostTitle').val(),
        category: $('#currentCategory').text(),
        content: $('#newPostContent').val(),
        tags: $('#newPostTags').val(),
        filesTrackerUUID: filesTrackerUUID
    };

    // Make an AJAX request
    $.ajax({
        url: originURL + '/api/discuss.php',
        type: 'POST',
        contentType: 'application/json', // Specify content type as JSON
        data: JSON.stringify(formData), // Convert data to JSON string
        success: function(response) {
            // Handle success response
            console.log('Post submitted successfully:', response);
        },
        error: function(error) {
            // Handle error response
            console.error('Error submitting post:', error);
            updateAlert('Sorry, there was an error submitting your post. Please try again later.', 'An error occurred: ');
        }
    });
    // Upload the files
    uploadFiles(filesTrackerUUID);
}
function uploadFiles(filesTrackerUUID) {
    return false;
    // Create FormData object for file uploads
    var fileFormData = new FormData();

    // Append files and associated tracker UUID to FormData
    for (var i = 0; i < newPostFiles.length; i++) {
        fileFormData.append('files[]', newPostFiles[i]);
    }
    fileFormData.append('filesTrackerUUID', filesTrackerUUID);

    // Make the second AJAX request to upload files
    $.ajax({
        url: originURL + '/api/uploadFiles.php', // Update with the actual upload endpoint
        type: 'POST',
        data: fileFormData,
        processData: false,
        contentType: false,
        success: function(response) {
            // Handle success response
            console.log('Files uploaded successfully:', response);
        },
        error: function(error) {
            // Handle error response
            console.error('Error uploading files:', error);
            updateAlert('Sorry, there was an error uploading your files. Please try again later.', 'An error occurred: ');
        }
    });
}