import React from "react";
import Head from "next/head";
import CustomOG from "../customOG/CustomOG";
import {object, string} from "prop-types";

export default function PageDescription({title, description, og = {}} = {}) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description}/>
      </Head>
      <CustomOG {...og}/>
    </>
  )
}

PageDescription.propTypes = {
  title: string,
  description: string,
  og: object,
};
