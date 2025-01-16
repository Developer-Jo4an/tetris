import React from 'react';
import { Provider } from 'react-redux';
import store from '../redux/store';
import MainLayout from '../components/layouts/MainLayout';
import PropTypes from "prop-types";
import '../styles/main.scss';

const MyApp = ({Component, pageProps}) => {
  return (
    <Provider store={store}>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </Provider>
  );
};

MyApp.propTypes = {
  Component: PropTypes.elementType,
  pageProps: PropTypes.object
};

export default MyApp;
