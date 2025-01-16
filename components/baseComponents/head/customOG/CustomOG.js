import React from "react";
import Head from "next/head";
import {phpContent} from "../../../../utils/php-utils/php-content";
import {bool, string} from "prop-types";

function getContent(isPHP, content, selector, attr) {
  return isPHP ? phpContent(selector, attr)(content) : content;
}

export default function CustomOG({title, description, isPHP, image = "", url = ""}) {

  return (
    <Head>
      <meta property="og:title" content={
        getContent(isPHP, title, 'meta[property="og:title"]', "content")
      }/>
      <meta name="description" content={
        getContent(isPHP, description, 'meta[name="description"]', "content")
      }/>
      <meta property="og:description"
            content={
              getContent(isPHP, description, 'meta[property="og:description"]', "content")
            }/>
      <meta property="og:url" content={
        getContent(isPHP, url, 'meta[property="og:url"]', "content")
      }/>
      <meta name="og:url" content={
        getContent(isPHP, url, 'meta[name="og:url"]', "content")
      }/>
      <meta content="1200" property="og:image:width"/>
      <meta content="630" property="og:image:height"/>
      <meta content="summary_large_image" name="twitter:card"/>
      <meta content={
        getContent(isPHP, image.default || image, 'meta[property="og:image"]', "content")
      } property="og:image"/>
      <meta content={
        getContent(isPHP, image.tw || image, 'meta[name="twitter:image"]', "content")
      } name="twitter:image"/>
      <meta content={
        getContent(isPHP, image.vk || image, 'meta[name="vk:image"]', "content")
      } name="vk:image"/>
      <meta content={
        getContent(isPHP, image.vk || image, 'meta[property="vk:image"]', "content")
      } property="vk:image"/>
    </Head>
  )
}

CustomOG.propTypes = {
  title: string,
  description: string,
  isPHP: bool,
  image: string,
  url: string,
};
