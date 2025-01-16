import React from 'react';
import PageDescription from "../components/baseComponents/head/pageDescription/PageDescription";
import defaultPage from "../constants/page-description";
import Scene from "../components/pixiComponent/Scene";

export default function Home() {

  return (
    <div className="container">
      <PageDescription {...defaultPage}/>
      <Scene/>
    </div>
  );
}

export async function getStaticProps() {
  return {
    props: {},
  };
}
