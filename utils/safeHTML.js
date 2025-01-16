import React from "react";
import ReactHtmlParser from 'react-html-parser';

export function safeHTML(htmlString) {
  return <>{ReactHtmlParser(htmlString)}</>
}
