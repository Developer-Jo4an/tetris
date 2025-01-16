import React, {useEffect, useMemo} from "react";
import {array} from "prop-types";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import {useSelector} from "react-redux";

export default function ModalController({modalStorage}) {
  useSelector(data => data.modalReducer);

  const firstModal = useMemo(() => ({id: null}), []);
  const scrollTop = useMemo(() => ({value: null}), []);

  useEffect(() => {
    if (!modalStorage.length) {
      const body = document.documentElement.querySelector("body");
      if (!body.classList.contains("scroll-disabler")) return;

      body.classList.remove("scroll-disabler");
      body.style.removeProperty("top");

      const el = document.scrollingElement || document.documentElement;
      el.scrollTop = scrollTop.value;

      firstModal.id = null;
      return;
    }

    if (firstModal.id !== null) return;

    firstModal.id = modalStorage[0].id;

    const el = document.scrollingElement || document.documentElement;
    const scrollTopValue = el.scrollTop;
    scrollTop.value = scrollTopValue;

    const body = document.documentElement.querySelector("body");
    body.classList.add("scroll-disabler");
    body.style.top = `-${scrollTopValue}px`;
  }, [modalStorage.length]);

  const modals = modalStorage ? modalStorage.map((val) =>
    <CSSTransition classNames='custom-modal' timeout={{enter: 500, exit: 500}} key={val.id}>
      {val.modal}
    </CSSTransition>
  ) : <></>;

  return (
    <TransitionGroup component={null}>
      {modals}
    </TransitionGroup>
  )
}

ModalController.propTypes = {
  modalStorage: array,
};
