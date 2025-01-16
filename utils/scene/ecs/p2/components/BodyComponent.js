import Component from "../../core/Component";

export default class BodyComponent extends Component {

  name = "unknown";

  subtype = "unknown";

  contacts = [];

  contactsMaterials = [];

  material;

  _p2Body = null;

  constructor({contacts, subtype, name, ...data}) {
    super(data);
    this.name = name ?? "unknown";
    this.subtype = subtype ?? "unknown";
    this.contacts = contacts ?? [];
  }

  set p2Body(p2Body) {
    this._p2Body = p2Body;
    this.onChange();
  }

  get p2Body() {
    return this._p2Body;
  }
}
