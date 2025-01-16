import React from "react";

export default function PictureSources({srcSetPrefix, sources} = {}) {
  return sources
    .map(({srcSetSuffix, media, type, srcSet}, index) => (
      <source key={index} srcSet={srcSet || `${srcSetPrefix}${srcSetSuffix}`} type={type} media={media}/>));
}
