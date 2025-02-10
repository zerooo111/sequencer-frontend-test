import { PublicKey } from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars

import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@coral-xyz/borsh";
import { BN } from "@coral-xyz/anchor";

export interface OrderIntentFields {
  order_id: BN;
  owner: PublicKey;
  side: types.OrderSideKind;
  price: BN;
  quantity: BN;
  expiry: BN;
}

export interface OrderIntentJSON {
  order_id: string;
  owner: string;
  side: types.OrderSideJSON;
  price: string;
  quantity: string;
  expiry: string;
}

export class OrderIntent {
  readonly order_id: BN;
  readonly owner: PublicKey;
  readonly side: types.OrderSideKind;
  readonly price: BN;
  readonly quantity: BN;
  readonly expiry: BN;

  constructor(fields: OrderIntentFields) {
    this.order_id = fields.order_id;
    this.owner = fields.owner;
    this.side = fields.side;
    this.price = fields.price;
    this.quantity = fields.quantity;
    this.expiry = fields.expiry;
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.u64("order_id"),
        borsh.publicKey("owner"),
        types.OrderSide.layout("side"),
        borsh.u64("price"),
        borsh.u64("quantity"),
        borsh.u64("expiry"),
      ],
      property
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new OrderIntent({
      order_id: obj.order_id,
      owner: obj.owner,
      side: types.OrderSide.fromDecoded(obj.side),
      price: obj.price,
      quantity: obj.quantity,
      expiry: obj.expiry,
    });
  }

  static toEncodable(fields: OrderIntentFields) {
    return {
      order_id: fields.order_id,
      owner: fields.owner,
      side: fields.side.toEncodable(),
      price: fields.price,
      quantity: fields.quantity,
      expiry: fields.expiry,
    };
  }

  toJSON(): OrderIntentJSON {
    return {
      order_id: this.order_id.toString(),
      owner: this.owner.toString(),
      side: this.side.toJSON(),
      price: this.price.toString(),
      quantity: this.quantity.toString(),
      expiry: this.expiry.toString(),
    };
  }

  static fromJSON(obj: OrderIntentJSON): OrderIntent {
    return new OrderIntent({
      order_id: new BN(obj.order_id),
      owner: new PublicKey(obj.owner),
      side: types.OrderSide.fromJSON(obj.side),
      price: new BN(obj.price),
      quantity: new BN(obj.quantity),
      expiry: new BN(obj.expiry),
    });
  }

  toEncodable() {
    return OrderIntent.toEncodable(this);
  }
}
