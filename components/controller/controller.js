import React, {Component} from 'react';
import {connect} from 'react-redux';
import OrientationController from './orientation-controller';
import MouseController from './mouse-controller';
import ScrollController from './scroll-controller';
import {getRef} from './reducer/controller';

// default плагины добавляются всегда кроме тех случаев, когда все пропы из toRender === true,
// !default добавляются если хотя бы один === true
const pluginData = {
  MouseController,
  ScrollController,
  OrientationController,
};

class ControllerComponent extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.plugins === undefined || nextProps.plugins.length !== this.props.plugins.length) {
      return true;
    }

    return this.props.plugins.some(
      (item, index) => nextProps.plugins[index].uuid !== item.uuid || nextProps.plugins[index].plugin !== item.plugin
    );
  }

  render() {
    return (
      <>
        {this.props.plugins && this.props.plugins.map((plugin) => (
          <React.Fragment key={plugin.uuid}>
            {
              React.createElement(
                pluginData[plugin.plugin],
                {
                  target: plugin.window || !getRef(plugin.target) ?
                    global.window : getRef(plugin.target).current ?
                      getRef(plugin.target).current : getRef(plugin.target),
                  ...plugin.props,
                },
              )
            }
          </React.Fragment>
        ))}
      </>
    );
  }
}

function mapStateToProps(state) {
  const {controllerReducer} = state;
  return {plugins: controllerReducer.plugins};
}

export const intersectionObserver = global?.window?.IntersectionObserver ? new IntersectionObserver((entries) => {
  entries.forEach(({target, isIntersecting}) => {
    target.dispatchEvent(new CustomEvent("controller-intersection-observer:visibility", {detail: isIntersecting}));
  });
}) : () => {
};

const Controller = connect(mapStateToProps)(ControllerComponent);
export default Controller;
