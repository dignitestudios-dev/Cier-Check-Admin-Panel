/**
 * Converts any YouTube URL format to the standard embed format
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID?si=...
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 * 
 * Returns: { videoId, embedLink, isValid, error }
 */
export const convertYoutubeUrl = (url) => {
  if (!url || typeof url !== "string") {
    return {
      videoId: null,
      embedLink: null,
      isValid: false,
      error: "URL must be a non-empty string",
    };
  }

  const trimmedUrl = url.trim();

  // Pattern 1: https://www.youtube.com/watch?v=VIDEO_ID
  const watchPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const watchMatch = trimmedUrl.match(watchPattern);
  if (watchMatch && watchMatch[1]) {
    const videoId = watchMatch[1];
    return {
      videoId,
      embedLink: `https://www.youtube.com/embed/${videoId}`,
      isValid: true,
      error: null,
    };
  }

  // Pattern 2: https://youtu.be/VIDEO_ID or https://youtu.be/VIDEO_ID?si=...
  const shortPattern = /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/;
  const shortMatch = trimmedUrl.match(shortPattern);
  if (shortMatch && shortMatch[1]) {
    const videoId = shortMatch[1];
    return {
      videoId,
      embedLink: `https://www.youtube.com/embed/${videoId}`,
      isValid: true,
      error: null,
    };
  }

  // Pattern 3: https://www.youtube.com/embed/VIDEO_ID or with params like ?si=...
  const embedPattern = /(?:https?:\/\/)?(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/;
  const embedMatch = trimmedUrl.match(embedPattern);
  if (embedMatch && embedMatch[1]) {
    const videoId = embedMatch[1];
    return {
      videoId,
      embedLink: `https://www.youtube.com/embed/${videoId}`,
      isValid: true,
      error: null,
    };
  }

  // If no pattern matched, try to extract 11-char video ID from anywhere in the URL
  const videoIdPattern = /([a-zA-Z0-9_-]{11})/;
  const videoIdMatch = trimmedUrl.match(videoIdPattern);
  if (videoIdMatch && videoIdMatch[1]) {
    const videoId = videoIdMatch[1];
    return {
      videoId,
      embedLink: `https://www.youtube.com/embed/${videoId}`,
      isValid: true,
      error: null,
    };
  }

  return {
    videoId: null,
    embedLink: null,
    isValid: false,
    error:
      "Invalid YouTube URL. Please use: watch URL, short link (youtu.be), or embed URL",
  };
};

/**
 * Validates if a URL is a valid YouTube embed link
 */
export const isValidEmbedLink = (embedLink) => {
  if (!embedLink || typeof embedLink !== "string") {
    return false;
  }

  const patterns = [
    /^https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]{11})$/,
    /^https:\/\/www\.youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})$/,
  ];

  return patterns.some((pattern) => pattern.test(embedLink.trim()));
};

/**
 * Extract video ID from embed link
 */
export const extractVideoIdFromEmbedLink = (embedLink) => {
  if (!embedLink) return null;
  const match = embedLink.match(/embed\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};
