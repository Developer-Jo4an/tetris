import {CSSTransition} from "react-transition-group";

export const Loader = ({isVisible}) => {
  return (
    <CSSTransition
      appear={true}
      mountOnEnter={true}
      unmountOnExit={true}
      timeout={500}
      classNames={"loader"}
      in={isVisible}
    >
      <div className={"loader"}>
        <div className={"loader__spinner"}/>
      </div>
    </CSSTransition>
  );
};

export default Loader;
