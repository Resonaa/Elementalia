export class Position {
  q: number;
  r: number;

  get s() {
    return -(this.q + this.r);
  }

  constructor(q: number = 0, r: number = 0) {
    this.q = q;
    this.r = r;
  }

  clone() {
    return new Position(this.q, this.r);
  }

  set(q: number, r: number) {
    this.q = q;
    this.r = r;
    return this;
  }

  add(other: Position) {
    return new Position(this.q + other.q, this.r + other.r);
  }

  sub(other: Position) {
    return new Position(this.q - other.q, this.r - other.r);
  }

  toString() {
    return `${this.q},${this.r}`;
  }

  eq(other: Position) {
    return this.toString() === other.toString();
  }

  pixelize() {
    return new Position(Math.sqrt(3) * (this.q + this.r / 2), (3 / 2) * this.r);
  }

  toArray() {
    return [this.q, this.r];
  }

  dist(other: Position) {
    return Math.max(
      Math.abs(this.q - other.q),
      Math.abs(this.r - other.r),
      Math.abs(this.s - other.s),
    );
  }

  static fromString(s: string) {
    const [q, r] = s.split(",");
    return new Position(parseInt(q), parseInt(r));
  }
}
