import React, {useEffect, useRef} from "react";
import UserInputController from "./src/UserInputController";
import applyRef from "../../../../utils/element/applyRef";


const UserInputItem = React.forwardRef(
  function UserInputItem({children, ignoreItem = false, ...rest}, ref) {

    const itemRef = useRef();

    useEffect(() => {
      const uuid = UserInputController.instance.init({...rest, ignoreItem, ref: itemRef});
      return () => UserInputController.instance.destroy(uuid);
    }, []);


    if (children.length > 0)
      throw new Error("UserInputComponent: child must be single");

    const newChildren = React.Children.map(
      children,
      child => {
        if (React.isValidElement(child))
          return React.cloneElement(child, {
            ...child.props,
            ref: (node) => {
              applyRef(itemRef, node);
              applyRef(ref, node);
              applyRef(child.ref, node);
            }
          });
      });

    return (
      <>
        {newChildren}
      </>
    );
  });

export default UserInputItem;
UserInputItem.propTypes = {};

