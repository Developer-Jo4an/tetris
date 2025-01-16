import React from 'react';
import * as PropTypes from "prop-types";
import HeaderLogo from "./HeaderLogo";
import HeaderBurger from "./HeaderBurger";
import HeaderMenu from "./HeaderMenu";

export default function Header({burger = true, logo, menu, children} = {}) {
  return (
    <header className={'header custom-header'}>
      <div className={'header__block custom-header__block'}>
        {logo ? <HeaderLogo logo={logo}/> : null}
        {menu ? <HeaderMenu menu={menu}/> : null}
        {burger ? <HeaderBurger/> : null}
        {children}
      </div>
    </header>
  );
}

Header.propTypes = {
  /*
    В зависмости от параметра бургер для меню либо добавляется либо нет
  */
  burger: PropTypes.bool,
  /*
    Компонент, который будет добавлятся в logo
  */
  logo: PropTypes.element,
  /*
    Компонент, который будет добавлятся в качестве меню
  */
  menu: PropTypes.element,

  children: PropTypes.element
};
