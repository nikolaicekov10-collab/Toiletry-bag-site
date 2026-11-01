export type Courier = "econt" | "speedy" | "boxnow";
export type CourierLocation = {
  id: string;
  carrier: Courier;
  kind: "office" | "locker" | "mobile";
  city: string;
  postCode: string;
  name: string;
  address: string;
  code: string;
};
