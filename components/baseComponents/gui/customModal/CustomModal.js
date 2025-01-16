import React from "react";
import PropTypes from 'prop-types';

export default function CustomModal(props) {
  return (
    <div className={`custom-modal ${props.animation} ${props.horizontalPosition} ${props.verticalPosition}`}>
      <div className={"custom-modal__bg"}/>
      <div className={"custom-modal__block"}>
        <div className={"custom-modal__content"}>
          {props.children}
        </div>
      </div>
    </div>
  )
}

CustomModal.propTypes = {
  /*
   * fade
   * scale
   * slide-right
   * slide-in
   * fall
   * side-fall
   * flip-horiz
   * flip-vert
   * super-scale
   * rotate-left
   */
  animation: PropTypes.string,
  /*
   * custom-modal_left
   * custom-modal_right
   */
  horizontalPosition: PropTypes.string,
  /*
   * custom-modal_top
   * custom-modal_bottom
   */
  verticalPosition: PropTypes.string,
  children: PropTypes.node,
};
