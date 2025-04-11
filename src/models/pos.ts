import { immerable } from "immer";

export class Pos {
  readonly [immerable] = true;

  get s() {
    return -(this.q + this.r);
  }

  constructor(
    public q = 0,
    public r = 0
  ) {}

  set(q: number, r: number) {
    this.q = q;
    this.r = r;
    return this;
  }

  add(other: Pos) {
    return new Pos(this.q + other.q, this.r + other.r);
  }

  sub(other: Pos) {
    return new Pos(this.q - other.q, this.r - other.r);
  }

  toString() {
    return `${this.q},${this.r}`;
  }

  eq(other: Pos) {
    return this.toString() === other.toString();
  }

  pixelize() {
    return new Pos(Math.sqrt(3) * (this.q + this.r / 2), (3 / 2) * this.r);
  }

  dist(other = new Pos()) {
    return Math.max(
      Math.abs(this.q - other.q),
      Math.abs(this.r - other.r),
      Math.abs(this.s - other.s)
    );
  }

  static fromString(s: string) {
    const [q, r] = s.split(",");
    return new Pos(Number.parseInt(q), Number.parseInt(r));
  }
}
