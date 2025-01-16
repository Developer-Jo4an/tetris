import React from "react";

<% if (type === "class") { %>
export default class <%-ClassName%> extends React.Component {
  render() {
    return (
      <div className={"<%-class_name%>"}>
      </div>
    );
  }
}
<% } else { %>
const <%-ClassName%> = React.forwardRef(
  function <%-ClassName%>({}, ref) {
    return (
      <div className={"<%-class_name%>"} ref={ref}>
      </div>
    );
  });
export default <%-ClassName%>;
<%-ClassName%>.propTypes = {};
<% } %>
