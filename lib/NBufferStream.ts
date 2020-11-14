import {Marker} from './interfaces';

export abstract class NBufferStream<T> {

  bigEndian: boolean;

  get littleEndian(): boolean {
    return !this.bigEndian;
  }

  set littleEndian(value: boolean) {
    this.bigEndian = !value;
  }

  abstract nextUInt8(): number;

  abstract nextInt8(): number;

  abstract nextUInt16(): number;

  abstract nextUInt32(): number;

  abstract nextInt16(): number;

  abstract nextInt32(): number;

  abstract nextFloat(): number;

  abstract nextDouble(): number;

  abstract nextBuffer(length: number): T;

  abstract remainingLength(): number;

  abstract nextString(length: number): string;

  abstract mark(): Marker<NBufferStream<T>>;

  abstract offsetFrom(marker: { offset: number }): number;

  abstract skip(amount: number);

  abstract branch(offset: number, length: number): NBufferStream<T>;

  abstract openWithOffset(offset: number): NBufferStream<T>;
}
