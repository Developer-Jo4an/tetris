import Component from "../../core/Component";

export default class BodyComponent extends Component {

  _matterBody = null;

  set matterBody(matterBody) {
    this._matterBody = matterBody;
    this.onChange();
  }

  get matterBody() {
    return this._matterBody;
  }
}
