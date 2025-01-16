export default function objectFit({current}, type){
  if (!current) return;

  current.onload = ()=>{
    onLoad(current, type);
  };

  current.onloadeddata = ()=>{
    onLoad(current, type);
  };
}

function onLoad(element, type){
  element.onload = null;
  element.onloadeddata = null;
  fit(element, type);
}

export function fit(element, type){
  const width = element.videoWidth || element.naturalWidth;
  const height = element.videoHeight || element.naturalHeight;

  const xScale = width / element.parentNode.offsetWidth;
  const yScale = height / element.parentNode.offsetHeight;
  const portrait = xScale < yScale;

  if (type === "contain"){
    element.style[portrait ? "height" : "width"] = `100%`;
    element.style[portrait ? "width" : "height"] = null;
  }

  if (type === "cover"){
    element.style[portrait ? "width" : "height"] = `100%`;
    element.style[portrait ? "height" : "width"] = null;
  }
}
