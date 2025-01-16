import React from "react";
import Document, {Html, Head, Main, NextScript} from 'next/document'
import analyticsHead from "../constants/analytics/analyticsHead.html";
import analyticsBody from "../constants/analytics/analyticsBody.html";
import parse from 'html-react-parser';


class CustomDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return {...initialProps}
  }

  render() {
    return (
      <Html>
        <Head>
          <meta charSet="utf-8"/>
          <meta name="theme-color" content="#ffffff"/>
          <meta name="mobile-web-app-capable" content="yes"/>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
          <meta name="apple-mobile-web-app-capable" content="yes"/>
          <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
          <link href="fonts/fonts.css" rel="stylesheet"/>
          <link rel="icon" href="favicon.ico"/>
          {parse(analyticsHead)}
        </Head>
        <body>
          {parse(analyticsBody)}
          <Main/>
          <NextScript/>
        </body>
      </Html>
    )
  }
}

export default CustomDocument;
