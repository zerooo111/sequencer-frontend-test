import * as OrderSide from "./OrderSide";

export { OrderIntent } from "./OrderIntent";
export type { OrderIntentFields, OrderIntentJSON } from "./OrderIntent";

export { OrderSide };

export type OrderSideKind = OrderSide.Buy | OrderSide.Sell;
export type OrderSideJSON = OrderSide.BuyJSON | OrderSide.SellJSON;
