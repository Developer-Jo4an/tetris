
export default class PseudoRandom {
  constructor({base} = {base: 1}) {
    this._base = base;
    this.updateChance();
  }

  updateChance() {
    this.increase = this.CfromP(this._base);
    this.currentChance = this.increase;
  }

  set base(base) {
    this._base = base;
    this.updateChance();
  }

  test() {
    const {increase} = this;
    const result = Math.random() <= this.currentChance;
    if (result)
      this.currentChance = increase;
    else
      this.currentChance += increase;

    return result;
  }

  CfromP(p) {
    let Cupper = p;
    let Clower = 0;
    let Cmid;
    let p1;
    let p2 = 1;
    while (true) {
      Cmid = (Cupper + Clower) / 2;
      p1 = this.PfromC(Cmid);
      if (Math.abs(p1 - p2) <= 0)
        break;

      if (p1 > p)
        Cupper = Cmid;
      else
        Clower = Cmid;
      p2 = p1;
    }
    return Cmid;
  }

  PfromC(C) {
    let pProcOnN = 0;
    let pProcByN = 0;
    let sumNpProcOnN = 0;

    const maxFails = Math.ceil(1 / C);
    for (let N = 1; N <= maxFails; ++N) {
      pProcOnN = Math.min(1, N * C) * (1 - pProcByN);
      pProcByN += pProcOnN;
      sumNpProcOnN += N * pProcOnN;
    }
    return (1 / sumNpProcOnN);
  }
}
