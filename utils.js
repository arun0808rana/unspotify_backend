const fs = require("fs");
const ytdl = require("ytdl-core");
const path = require("path");
const os = require("os");
const ytpl = require("ytpl");

module.exports = async function addMedia(url) {
  const itag = "140";
  let result = {
    success: false,
    error: null,
  };

  if (isSingleVideoUrl(url)) {
    // Single video URL
    result = downloadSingleAudio(url, itag);
  } else {
    // Playlist URL
    result = downloadPlaylist(url, itag);
  }

  return result;
};

async function downloadSingleAudio(url, itag) {
  if (!url) {
    console.log("No URL found.");
    return;
  }

  const videoId = ytdl.getVideoID(url);
  const videoInfo = ytdl.getInfo(videoId);

  videoInfo
    .then((info) => {
      const format = ytdl.chooseFormat(info.formats, { quality: itag });
      if (format) {
        const audoFileName =
          getValidName(info.videoDetails.title) + `.${format.container}`;

        const authorName = info.videoDetails.author.name;
        const destinationFolder = `downloads/${authorName}`;

        // Create the downloads and author folders if they doesn't exist
        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
        }

        const filePath = path.join(destinationFolder, audoFileName);

        // console.log("Video Info", info.videoDetails);

        // Download the video using the selected format
        ytdl(url, { format })
          .pipe(fs.createWriteStream(filePath))
          .on("finish", () => {
            console.log(`[Download complete] : ${audoFileName}`);
            return {
              success: true,
              error: null,
            };
          })
          .on("error", (error) => {
            console.error("Error while downloading file:", error);
            return { success: false, error };
          });
      } else {
        console.error("Desired format not found!");
        return { success: false, error: new Error("Format not found.") };
      }
    })
    .catch((error) => {
      console.error("Error while retrieving video info:", error);
      return { success: false, error };
    });
}

async function downloadPlaylist(url, itag) {
  const playlist = await ytpl(url);
  //   console.log("Playlist :>> ", playlist.items);
  let videoIndex = 0;
  try {
    const videos = playlist.items;
    videos.forEach((video) => {
      const videoUrl = video.shortUrl || video.url;
      videoIndex = video.index;
      downloadSingleAudio(videoUrl, itag);
    });
  } catch (error) {
    console.error(`Error fetching ${videoIndex}: ${error.message}`);
  }
}

function getValidName(name) {
  // Regex patterns for Windows, Ubuntu, and macOS
  const windowsPattern = /[<>:"/\\|?*\u0000-\u001F]/g;
  const ubuntuPattern = /[^\w\s.-]/g;
  const macPattern = /[:/]/g;

  // Determine the platform based on the operating system
  const platform = os.platform().toLowerCase();
  let pattern;
  if (platform.includes("win")) {
    pattern = windowsPattern;
  } else if (platform.includes("darwin")) {
    pattern = macPattern;
  } else {
    pattern = ubuntuPattern;
  }

  // Replace invalid characters with an underscore
  let validName = name.replace(pattern, "_");

  // Replace consecutive spaces and underscores with a single underscore
  validName = validName.replace(/[\s_]+/g, "_");

  return validName;
}

function isSingleVideoUrl(url) {
  // Regular expression to match single video URLs
  var regex = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+(&\S*)?$/;
  return regex.test(url);
}

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
