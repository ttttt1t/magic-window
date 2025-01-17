//most of this is chatgpt

document.addEventListener("DOMContentLoaded", async () => {
    const TARGET_AUDIO_COUNT = 10;    // Target number of audio files in the list
    const REFILL_THRESHOLD = 5;      // Threshold to trigger a refill
    const FETCH_LIMIT = 300;           // Number of files to fetch per request
    const PLAY_DELAY = 300;          // Delay between tracks in milliseconds

    let audioUrls = [];
    let currentTrack = 0;
    const audioPlayer = document.getElementById("audioPlayer");
    const queueList = document.getElementById("queueList");
    const randomImageElement = document.getElementById("randomImage");

    // Function to fetch audio URLs with preloaded images
    async function fetchRandomMediaWithImages(limit = FETCH_LIMIT) {
        const newMedia = [];
        const randomFilesUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=random&grnnamespace=6&grnlimit=${limit}&prop=imageinfo&iiprop=url|mime`;

        try {
            const response = await fetch(randomFilesUrl);
            const data = await response.json();
            const imageUrls = await preloadRandomImages(limit);  // Preload images

            let imageIndex = 0;

            // Process and add media with preloaded images
            for (const pageId in data.query.pages) {
                const file = data.query.pages[pageId];
                const mime = file.imageinfo[0].mime;

                if (mime.startsWith("audio/")) {
                    // Associate each audio with a preloaded image from the list
                    const imageUrl = imageUrls[imageIndex] || null;
                    imageIndex += 1;

                    newMedia.push({
                        url: file.imageinfo[0].url,
                        title: file.title,
                        image: imageUrl
                    });
                }
            }

            console.log("Fetched new audio URLs with images:", newMedia);
            return newMedia;

        } catch (error) {
            console.error("Error fetching media URLs:", error);
            return [];
        }
    }

    // Function to preload random images
    async function preloadRandomImages(count) {
        const imageUrls = [];
        const randomImageUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=random&grnnamespace=6&grnlimit=${count}&prop=imageinfo&iiprop=url|mime`;

        try {
            const response = await fetch(randomImageUrl);
            const data = await response.json();

            for (const pageId in data.query.pages) {
                const file = data.query.pages[pageId];
                if (file.imageinfo && file.imageinfo[0].mime.startsWith("image/")) {
                    imageUrls.push(file.imageinfo[0].url);
                }
            }

            console.log("Preloaded images:", imageUrls);
            return imageUrls;

        } catch (error) {
            console.error("Error preloading images:", error);
            return [];
        }
    }

    // Function to maintain audio list with associated images
    async function maintainAudioList() {
        while (audioUrls.length < TARGET_AUDIO_COUNT) {
            const newMedia = await fetchRandomMediaWithImages(FETCH_LIMIT);
            audioUrls = audioUrls.concat(newMedia);
            updateQueueDisplay();
        }
    }

    // Function to update the queue display
    function updateQueueDisplay() {
        queueList.innerHTML = ''; // Clear the current list
        audioUrls.forEach((audio, index) => {
            const listItem = document.createElement("li");
            listItem.textContent = audio.title;
            listItem.classList.toggle("playing", index === currentTrack);

            // Add click handler to allow playing specific audio in the list
            listItem.onclick = () => {
                currentTrack = index;
                playCurrentTrack();
            };

            queueList.appendChild(listItem);
        });
    }

    // Function to play the current track with preloaded image
    function playCurrentTrack() {
        if (audioUrls.length === 0) {
            console.warn("No audio files left to play.");
            return;
        }

        // Set the audio source and display preloaded image
        const currentAudio = audioUrls[currentTrack];
        audioPlayer.src = currentAudio.url;
        randomImageElement.src = currentAudio.image || ""; // Display the preloaded image
        audioPlayer.play();

        // Update queue display to show the current playing track
        updateQueueDisplay();

        // Remove the file after playback with a delay
        audioPlayer.onended = () => {
            setTimeout(() => {
                audioUrls.splice(currentTrack, 1);

                // If list size drops below the threshold, fetch more audio files
                if (audioUrls.length < REFILL_THRESHOLD) {
                    maintainAudioList();
                }

                // Reset currentTrack if at the end of the list
                if (currentTrack >= audioUrls.length) {
                    currentTrack = 0;
                }

                // Play the next track if available
                if (audioUrls.length > 0) {
                    playCurrentTrack();
                } else {
                    updateQueueDisplay();  // Clear display if no tracks remain
                }
            }, PLAY_DELAY); // Delay before playing the next track
        };
    }

    // Initialize and start playing
    await maintainAudioList();  // Fill up the list initially
    playCurrentTrack();         // Start playback    //if i remove this it stops working

    $(function() {
  $(".btn").click(function(e) {
    if ($(this).hasClass("play")) {
      $(this).toggleClass("play pause").html("&#9199;");
      // Trigger Play event
      audioPlayer.play()
    } else {
      $(this).toggleClass("play pause").html("&#9199;");
      // Trigger Pause Event
      audioPlayer.pause()
    }
  });
});


  $(function() {
  $(".btn1").click(function(e) {
      audioPlayer.onended()
})
});  
});
