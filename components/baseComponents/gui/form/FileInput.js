import React, { useState } from "react";
import LabelInput from "./LabelInput";

export default function FileInput({ ...props }) {
  const [isDragOver, setIsDragOver] = useState(false);
  return <LabelInput labelProps={ { onDragExit: () => setIsDragOver(false), onDragEnter: () => setIsDragOver(true) } }
                     type="file" { ...props }
                     style={ { display: "none" } }>
    <div style={ { display: isDragOver ? "block" : "none" } }>DragAndDrop</div>
    <div style={ { display: !isDragOver ? "block" : "none" } }>Click me</div>
  </LabelInput>;
}
