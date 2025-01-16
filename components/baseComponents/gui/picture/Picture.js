import React from "react";
import PropTypes from "prop-types";
import PictureImage from "./PictureImage";
import PictureSources from "./PictureSources";

export default function Picture({attr = {}, sourceData = {}, imgAttr} = {}) {
  return (
    <picture {...attr}>
      {imgAttr ? <PictureImage imgAttr={imgAttr}/> : null}
      {sourceData?.sources ?
        <PictureSources srcSetPrefix={sourceData.srcSetPrefix} sources={sourceData.sources}/> : null}
    </picture>
  );
}

Picture.propTypes = {
  /**
   * Объект с атрибутами для элемента picture
   */
  attr: PropTypes.object,

  /**
   * Данные для создания элементов source
   * ex: 1) sourceData:{
   *     srcSetPrefix:"images/intro/bg_m",
   *     sources: [
   *       {
   *         "srcSetSuffix": ".webp",
   *         "type": "image/webp",
   *         "media": "(max-width:1023px)"
   *       },
   *       {
   *         "srcSetSuffix": ".svg",
   *         "type": "image/svg",
   *         "media": "(max-width:1023px)"
   *       }
   *     ]
   *   }
   *   2) sourceData:{
   *     sources: [
   *       {
   *         "srcSet": "images/intro/bg_m.webp 1x,images/intro/bg_m@2x.webp 2x",
   *         "type": "image/webp",
   *         "media": "(max-width:1023px)"
   *       },
   *       {
   *         "srcSet": "images/intro/bg_m.webp 1x,images/intro/bg_m@2x.webp 2x",
   *         "type": "image/webp",
   *         "media": "(max-width:1023px)"
   *       }
   *     ]
   *   }
   */
  sourceData: PropTypes.object,
  /**
   * Объект с атрибутами для элемента img
   */
  imgAttr: PropTypes.object,
};
