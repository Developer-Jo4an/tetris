import BaseLoader from "../BaseLoader";

/**
 * {
 *       subtype: "base",
 *       type: "video",
 *       name: "videoName", - name for getting from AssetsManager
 *       url: "assets/video/",
 *       fileName: "video.mp4"
 * }
 */
export default class VideoLoader extends BaseLoader {


  load(settings) {
    const url = this.manager.resolveURL(`${settings.path}${settings.fileName}`);
    const key = super.load(url);

    return loadVideo(url).then(
      (data) => this.onLoad(settings, data, key),
      (error) => this.onError(error),
    );
  }
}


function loadVideo(videoUrl) {
  let video;

  try {
    video = new HTMLVideoElement();
  } catch (e) {
    video = document.createElement('video');
  }

  video.crossOrigin = 'anonymous';

  return new Promise((resolve, reject) => {
    video.src = videoUrl;
    video.load();

    video.addEventListener('canplaythrough', () => resolve(video));
    video.addEventListener('error', reject);
  });
}
