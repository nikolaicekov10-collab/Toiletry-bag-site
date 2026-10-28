"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, Mail, Menu, MessageSquare, Phone, ShoppingBag, X } from "lucide-react";
import courierLocationsData from "./data/courier-locations.json";
import { filterProducts } from "./product-filter";
import { applySecondProductDiscount, isPromotionEligible } from "./cart-pricing";
import { SearchDropdown } from "./search-dropdown";
import { CustomGallery } from "./custom-gallery";

const customCategoryName = "Твоят дизайн, създаден от Nikky’S" as const;

type Group =
  "Дамски аксесоари" | "Мъжки аксесоари" | "Скрънчита" | typeof customCategoryName;
type Audience = "women" | "men";
type ProductVariant = { name: string; tone: string; images: string[] };
type Product = {
  id: number;
  name: string;
  category: string;
  group: Group | Group[];
  price: number | null;
  discountEligible?: boolean;
  ecoLeather?: boolean;
  color: string;
  tone: string;
  images?: string[];
  colors?: { name: string; tone: string }[];
  variants?: ProductVariant[];
  imagesByAudience?: Record<Audience, string[]>;
  variantsByAudience?: Record<Audience, ProductVariant[]>;
  description?: string;
  descriptions?: { women: string; men: string };
  dimensions?: string;
  materials?: string;
};
type CartItem = Product & { quantity: number; image?: string; discount?: number };
type Courier = "econt" | "speedy" | "boxnow";
type CourierLocation = {
  id: string;
  carrier: Courier;
  kind: "office" | "locker" | "mobile";
  city: string;
  postCode: string;
  name: string;
  address: string;
  code: string;
};

const courierLocations = courierLocationsData as CourierLocation[];
const courierNames: Record<Courier, string> = { econt: "Еконт", speedy: "Спиди", boxnow: "BOX NOW" };

const toiletryColors = [
  { name: "Кафяв", tone: "#65473d", folder: "brown" },
  { name: "Черен", tone: "#171615", folder: "black" },
  { name: "Сив", tone: "#85827d", folder: "gray" },
  { name: "Сиво-бежов", tone: "#aaa092", folder: "greige" },
];

function toiletryImages(audience: Audience, folder: string) {
  const base = `/images/products/toiletry-bags/${audience}/${folder}`;
  return [`${base}/${audience === "women" && folder === "black" ? "front-repaired.png" : "front.png"}`, `${base}/side-a.png`, `${base}/side-b.png`];
}

function toiletryVariants(audience: Audience): ProductVariant[] {
  return toiletryColors.map(({ name, tone, folder }) => ({
    name,
    tone,
    images: toiletryImages(audience, folder),
  }));
}

const products: Product[] = [
  {
    id: 1,
    name: "Несесер Nikky’S",
    category: "Несесери",
    group: ["Дамски аксесоари", "Мъжки аксесоари"],
    ecoLeather: true,
    price: 35,
    color: "Кафяв",
    tone: "#65473d",
    colors: toiletryColors.map(({ name, tone }) => ({ name, tone })),
    description: "Когато козметиката и малките ти принадлежности имат свое място, подготовката за деня става по-лека и спокойна. Дамският несесер Nikky’S подрежда гримове, продукти за грижа, четки и малки аксесоари, така че да откриваш всичко бързо — у дома, в дамската чанта или при пътуване.\n\nРелефната капитонирана еко кожа придава елегантен вид, 3 мм дунапрен поддържа меката и стабилна форма, а вътрешността от американски сатен носи гладко и фино усещане. Практичното отваряне с цип превръща модела в удобен козметичен органайзер и несесер за пътуване.\n\nРъчно изработен с внимание към всеки детайл и характерния почерк на Nikky’S.",
    descriptions: {
      women: "Когато козметиката и малките ти принадлежности имат свое място, подготовката за деня става по-лека и спокойна. Дамският несесер Nikky’S подрежда гримове, продукти за грижа, четки и малки аксесоари, така че да откриваш всичко бързо — у дома, в дамската чанта или при пътуване.\n\nРелефната капитонирана еко кожа придава елегантен вид, 3 мм дунапрен поддържа меката и стабилна форма, а вътрешността от американски сатен носи гладко и фино усещане. Практичното отваряне с цип превръща модела в удобен козметичен органайзер и несесер за пътуване.\n\nРъчно изработен с внимание към всеки детайл и характерния почерк на Nikky’S.",
      men: "Редът спестява време и прави всяко тръгване по-лесно. Мъжкият несесер Nikky’S събира на едно място самобръсначка, четка и паста за зъби, дезодорант и ежедневни продукти за грижа, така че всичко необходимо да бъде подредено и лесно достъпно. Удобен е у дома, във фитнеса, при служебно пътуване или през уикенда.\n\nРелефната капитонирана еко кожа съчетава изчистен вид и практичност, 3 мм дунапрен помага на несесера да запази формата си, а американският сатен завършва вътрешността гладко и прецизно. Компактният мъжки несесер за тоалетни принадлежности подрежда багажа и освобождава място от разпилени вещи.\n\nРъчно изработен модел Nikky’S за повече ред, удобство и увереност в ежедневието и при пътуване.",
    },
    dimensions: "20 × 11 × 11 см (Д × В × Ш)",
    materials: "Капитонирана еко кожа · Дунапрен 3 мм · Американски сатен · Цип",
    images: toiletryImages("women", "brown"),
    variants: toiletryVariants("women"),
    imagesByAudience: {
      women: toiletryImages("women", "brown"),
      men: toiletryImages("men", "brown"),
    },
    variantsByAudience: {
      women: toiletryVariants("women"),
      men: toiletryVariants("men"),
    },
  },
  {
    id: 2,
    name: "Мини чанта Nikky’S",
    category: "Чанти",
    group: "Дамски аксесоари",
    ecoLeather: true,
    price: 35,
    color: "Кафяв",
    tone: "#65473d",
    colors: [
      { name: "Кафяв", tone: "#65473d" },
      { name: "Черен", tone: "#171615" },
      { name: "Сив", tone: "#85827d" },
      { name: "Сиво-бежов", tone: "#aaa092" },
    ],
    description: "Компактна чанта за дните, в които искаш да носиш само най-необходимото — телефон, ключове, мини портмоне и малка козметика. С дългата дръжка се носи удобно през рамо, а малката отделяща се дръжка я превръща в практична чанта за китка.\n\nВъншната част е изработена от релефна капитонирана еко кожа. Междинният слой от 3 мм дунапрен придава мекота и помага на чантата да запази формата си, а вътрешността от американски сатен осигурява гладък и елегантен завършек.\n\nРъчно изработен модел с метални елементи и характерното лого на Nikky’S.",
    materials: "Капитонирана еко кожа · Дунапрен 3 мм · Американски сатен · Метални елементи · Цип и метално лого Nikky’S",
    images: [
      "/images/products/shoulder-bags/mini-brown/lifestyle-front.png",
      "/images/products/shoulder-bags/mini-brown/lifestyle-wrist.png",
    ],
    variants: [
      {
        name: "Кафяв",
        tone: "#65473d",
        images: [
          "/images/products/shoulder-bags/mini-brown/lifestyle-front.png",
          "/images/products/shoulder-bags/mini-brown/lifestyle-wrist.png",
        ],
      },
      {
        name: "Черен",
        tone: "#171615",
        images: [
          "/images/products/shoulder-bags/mini-colors/black.png",
          "/images/products/shoulder-bags/mini-colors/lifestyle-wrist-black.png",
        ],
      },
      {
        name: "Сив",
        tone: "#85827d",
        images: [
          "/images/products/shoulder-bags/mini-colors/gray.png",
          "/images/products/shoulder-bags/mini-colors/lifestyle-wrist-gray.png",
        ],
      },
      {
        name: "Сиво-бежов",
        tone: "#aaa092",
        images: [
          "/images/products/shoulder-bags/mini-colors/greige.png",
          "/images/products/shoulder-bags/mini-colors/lifestyle-wrist-greige.png",
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Чанта за китка Nikky’S",
    category: "Чанти за китка",
    group: ["Дамски аксесоари", "Мъжки аксесоари"],
    ecoLeather: true,
    price: 40,
    color: "Кафяв",
    tone: "#4a3025",
    colors: [
      { name: "Кафяв", tone: "#4a3025" },
      { name: "Черен", tone: "#171615" },
      { name: "Сив", tone: "#85827d" },
      { name: "Сиво-бежово", tone: "#c9c0b6" },
    ],
    description: "Компактна и удобна чанта за най-необходимото в ежедневието. Подходяща е за телефон, портмоне, ключове и малка козметика, а практичната дръжка позволява да я носиш спокойно на китката или да я използваш като органайзер в по-голяма чанта.\n\nВъншната част е изработена от релефна капитонирана еко кожа. Междинният слой от 3 мм дунапрен помага на чантата да запази формата си и осигурява допълнителна мекота. Вътрешността е завършена с гладък американски сатен за елегантен и прецизен завършек.\n\nВсеки модел се изработва ръчно с внимание към детайла и носи характерния метален знак на Nikky’S.",
    materials: "Капитонирана еко кожа · Дунапрен 3 мм · Американски сатен · Метален цип и лого Nikky’S",
    images: [
      "/images/nikkys-casual-brown.png",
      "/images/products/wrist-bag/brown-worn.jpg",
      "/images/products/wrist-bag/brown-inside.jpg",
    ],
    variants: [
      {
        name: "Кафяв",
        tone: "#4a3025",
        images: [
          "/images/nikkys-casual-brown.png",
          "/images/products/wrist-bag/brown-worn.jpg",
          "/images/products/wrist-bag/brown-inside.jpg",
        ],
      },
      {
        name: "Сиво-бежово",
        tone: "#c9c0b6",
        images: [
          "/images/nikkys-casual-ivory.png",
          "/images/products/wrist-bag/ivory-detail.jpg",
          "/images/products/wrist-bag/ivory-inside.png",
        ],
      },
      {
        name: "Черен",
        tone: "#171615",
        images: [
          "/images/products/wrist-bag/generated/black-main.png",
          "/images/products/wrist-bag/generated/black-worn.png",
          "/images/products/wrist-bag/generated/black-inside.png",
        ],
      },
      {
        name: "Сив",
        tone: "#85827d",
        images: [
          "/images/products/wrist-bag/generated/gray-main.png",
          "/images/products/wrist-bag/generated/gray-worn.png",
          "/images/products/wrist-bag/gray-inside.png",
        ],
      },
    ],
  },
  {
    id: 6,
    name: "Мини портмоне Nikky’S",
    category: "Мини портмонета",
    group: "Дамски аксесоари",
    ecoLeather: true,
    price: 19,
    color: "Кафяв",
    tone: "#3b1714",
    colors: [
      { name: "Кафяв", tone: "#3b1714" },
      { name: "Черен", tone: "#171615" },
      { name: "Сив", tone: "#85827d" },
      { name: "Сиво-бежов", tone: "#aaa092" },
    ],
    description: "Компактно портмоне, създадено да подреди най-необходимото, без да заема излишно място. Подходящо е за карти, сгънати банкноти, монети и други малки лични вещи, а двете отделения помагат всичко да бъде лесно достъпно.\n\nВъншната част е изработена от релефна капитонирана еко кожа. Вътрешността е завършена с гладък американски сатен за приятен допир и прецизен завършек.\n\nВсяко мини портмоне се изработва ръчно с внимание към детайла и носи характерния метален знак на Nikky’S.",
    materials: "Капитонирана еко кожа · Американски сатен · Цип и метално лого Nikky’S",
    images: [
      "/images/products/mini-wallet/lifestyle-quilted.png",
      "/images/products/mini-wallet/colors/inside-brown.png",
    ],
    variants: [
      {
        name: "Кафяв",
        tone: "#3b1714",
        images: [
          "/images/products/mini-wallet/lifestyle-quilted.png",
          "/images/products/mini-wallet/colors/inside-brown.png",
        ],
      },
      {
        name: "Черен",
        tone: "#171615",
        images: [
          "/images/products/mini-wallet/colors/black.png",
          "/images/products/mini-wallet/colors/inside-black.png",
        ],
      },
      {
        name: "Сив",
        tone: "#85827d",
        images: [
          "/images/products/mini-wallet/colors/gray.png",
          "/images/products/mini-wallet/colors/inside-gray.png",
        ],
      },
      {
        name: "Сиво-бежов",
        tone: "#aaa092",
        images: [
          "/images/products/mini-wallet/colors/greige.png",
          "/images/products/mini-wallet/colors/inside-greige.png",
        ],
      },
    ],
  },
  {
    id: 7,
    name: "Чанта за рамо Nikky’S",
    category: "Чанти",
    group: "Дамски аксесоари",
    ecoLeather: true,
    price: 50,
    color: "Черен",
    tone: "#171615",
    colors: [
      { name: "Кафяв", tone: "#65473d" },
      { name: "Черен", tone: "#171615" },
      { name: "Сив", tone: "#85827d" },
      { name: "Сиво-бежов", tone: "#aaa092" },
    ],
    description: "Практична чанта през рамо с място за всичко важно през деня — телефон, портмоне, ключове и любима козметика. Удобните дръжки и изчистеният силует я правят лесна за съчетаване както с ежедневна, така и с по-елегантна визия. Вътрешният джоб с цип пази по-сигурно малките ценни вещи и ги държи лесно достъпни.\n\nВъншната част е изработена от релефна капитонирана еко кожа. Междинният слой от 3 мм дунапрен придава мекота и стабилност, а вътрешността от американски сатен завършва модела с гладко и фино усещане.\n\nРъчно изработена с внимание към детайла и характерното метално лого на Nikky’S.",
    materials: "Капитонирана еко кожа · Дунапрен 3 мм · Американски сатен · Вътрешен джоб с цип · Метален цип и лого Nikky’S",
    images: [
      "/images/products/shoulder-bags/standard-colors/black.png",
      "/images/products/shoulder-bags/standard-black/lifestyle-side.png",
      "/images/products/shoulder-bags/standard-black/interior-satin-pocket.png",
    ],
    variants: [
      {
        name: "Кафяв",
        tone: "#65473d",
        images: [
          "/images/products/shoulder-bags/standard-colors/brown.png",
          "/images/products/shoulder-bags/standard-generated/brown-side.png",
          "/images/products/shoulder-bags/standard-generated/brown-interior.png",
        ],
      },
      {
        name: "Черен",
        tone: "#171615",
        images: [
          "/images/products/shoulder-bags/standard-colors/black.png",
          "/images/products/shoulder-bags/standard-black/lifestyle-side.png",
          "/images/products/shoulder-bags/standard-black/interior-satin-pocket.png",
        ],
      },
      {
        name: "Сив",
        tone: "#85827d",
        images: [
          "/images/products/shoulder-bags/standard-colors/gray.png",
          "/images/products/shoulder-bags/standard-generated/gray-side.png",
          "/images/products/shoulder-bags/standard-generated/gray-interior.png",
        ],
      },
      {
        name: "Сиво-бежов",
        tone: "#aaa092",
        images: [
          "/images/products/shoulder-bags/standard-colors/greige.png",
          "/images/products/shoulder-bags/standard-generated/greige-side.png",
          "/images/products/shoulder-bags/standard-generated/greige-interior.png",
        ],
      },
    ],
  },
  {
    id: 8,
    name: "Стандартно сатенено скрънчи Nikky’S",
    category: "Стандартни скрънчита",
    group: "Скрънчита",
    price: 3,
    discountEligible: false,
    color: "Бордо",
    tone: "#7f1735",
    colors: [
      { name: "Бордо", tone: "#7f1735" },
      { name: "Светлосин", tone: "#b9d7ef" },
    ],
    images: [
      "/images/products/scrunchies/burgundy-01.png",
      "/images/products/scrunchies/burgundy-02.png",
    ],
    variants: [
      {
        name: "Бордо",
        tone: "#7f1735",
        images: [
          "/images/products/scrunchies/burgundy-01.png",
          "/images/products/scrunchies/burgundy-02.png",
        ],
      },
      {
        name: "Светлосин",
        tone: "#b9d7ef",
        images: ["/images/products/scrunchies/light-blue-01.png"],
      },
    ],
    description: "Нежен завършек за прическата, който лесно се вписва във всеки ден. Стандартното скрънчи Nikky’S е подходящо за опашка, кок или небрежно прибрана коса, когато търсиш удобство с елегантен и ненатрапчив акцент.\n\nМекият руски сатен се плъзга деликатно по косата и създава приятно усещане при носене. Размерът от 10–12 см осигурява красив обем, без аксесоарът да доминира над прическата. Компактно и лесно за носене в дамската чанта, то е практичен избор за работа, разходка, пътуване или ежедневните моменти, в които искаш косата ти да изглежда подредена без усилие.\n\nВсяко сатенено скрънчи се изработва ръчно с внимание към формата, мекотата и прецизния завършек.",
    dimensions: "Диаметър: приблизително 10–12 см",
    materials: "Руски сатен",
  },
  {
    id: 9,
    name: "XL сатенено скрънчи Nikky’S",
    category: "XL скрънчита",
    group: "Скрънчита",
    price: 6,
    discountEligible: false,
    color: "Бордо",
    tone: "#7f1735",
    colors: [
      { name: "Бордо", tone: "#7f1735" },
      { name: "Светлосин", tone: "#b9d7ef" },
    ],
    images: [
      "/images/products/scrunchies/burgundy-01.png",
      "/images/products/scrunchies/burgundy-02.png",
    ],
    variants: [
      {
        name: "Бордо",
        tone: "#7f1735",
        images: [
          "/images/products/scrunchies/burgundy-01.png",
          "/images/products/scrunchies/burgundy-02.png",
        ],
      },
      {
        name: "Светлосин",
        tone: "#b9d7ef",
        images: ["/images/products/scrunchies/light-blue-01.png"],
      },
    ],
    description: "Създадено да бъде забелязано. XL скрънчито Nikky’S придава обем и характер дори на най-семплата прическа, превръщайки обикновената опашка или кок в завършена визия.\n\nЩедрото количество мек руски сатен оформя красиви, богати гънки и създава изразителен силует. С диаметър 16–18 см моделът е подходящ за моментите, в които аксесоарът е част от стила — от небрежна дневна визия до по-специален повод. Може да се носи в косата или около китката като мек сатенен акцент.\n\nВсяко XL скрънчи се изработва ръчно, за да запази своя обем, мекота и отличителното присъствие на Nikky’S.",
    dimensions: "Диаметър: приблизително 16–18 см",
    materials: "Руски сатен",
  },
];
type Subcategory = { name: string; children?: string[] };
const groups: {
  name: Group;
  subtitle: string;
  subcategories: Subcategory[];
}[] = [
  {
    name: "Дамски аксесоари",
    subtitle: "Елегантност за всеки ден",
    subcategories: [
      { name: "Несесери" },
      { name: "Чанти" },
      { name: "Чанти за китка" },
      { name: "Мини портмонета" },
    ],
  },
  {
    name: "Мъжки аксесоари",
    subtitle: "Практични и изчистени",
    subcategories: [{ name: "Несесери" }, { name: "Чанти за китка" }],
  },
  { name: "Скрънчита", subtitle: "Сатенени аксесоари за коса", subcategories: [] },
  { name: customCategoryName, subtitle: "По твоя идея", subcategories: [] },
];

type Language = "bg" | "en";

const englishText: Record<string, string> = {
  [customCategoryName]: "Your design, created by Nikky’S",
  "По твоя идея": "Inspired by your idea",
  "Скрънчита": "Scrunchies",
  "Сатенени аксесоари за коса": "Satin hair accessories",
  "Стандартни скрънчита": "Standard scrunchies",
  "XL скрънчита": "XL scrunchies",
  "Дамски аксесоари": "Women’s accessories",
  "Мъжки аксесоари": "Men’s accessories",
  "Елегантност за всеки ден": "Everyday elegance",
  "Практични и изчистени": "Practical and refined",
  "Създадени за всеки": "Made for everyone",
  "Два стила в хармония": "Two styles in harmony",
  "Несесери": "Toiletry bags",
  "Чанти през рамо": "Shoulder bags",
  "Мини чанти през рамо": "Mini shoulder bags",
  "Стандартни чанти през рамо": "Standard shoulder bags",
  "Мини портмонета": "Mini wallets",
  "Чанти за китка": "Wrist bags",
  "Мъжки несесери": "Men’s toiletry bags",
  "Чанти": "Bags",
  "Раници": "Backpacks",
  "Кафяв": "Brown",
  "Черен": "Black",
  "Черно": "Black",
  "Сив": "Gray",
  "Сиво": "Gray",
  "Сиво-бежов": "Greige",
  "Сиво-бежово": "Greige",
  "Бордо": "Burgundy",
  "Светлосин": "Light blue",
  "Бежово": "Beige",
};

const productEnglish: Record<number, Partial<Product>> = {
  1: {
    name: "Toiletry Bag Nikky’S",
    category: "Toiletry bags",
    description: "When your cosmetics and small essentials have their own place, getting ready feels calmer and easier. The Nikky’S women’s toiletry bag keeps makeup, skincare, brushes and small accessories neatly organised, so everything is easy to find at home, inside your handbag or while travelling.\n\nTextured quilted eco leather gives it an elegant finish, a 3 mm foam layer provides soft structure, and the American satin lining adds a smooth, refined feel. The practical zip opening makes it a convenient makeup organiser and travel cosmetic bag.\n\nHandmade with careful attention to detail and the distinctive Nikky’S touch.",
    descriptions: {
      women: "When your cosmetics and small essentials have their own place, getting ready feels calmer and easier. The Nikky’S women’s toiletry bag keeps makeup, skincare, brushes and small accessories neatly organised, so everything is easy to find at home, inside your handbag or while travelling.\n\nTextured quilted eco leather gives it an elegant finish, a 3 mm foam layer provides soft structure, and the American satin lining adds a smooth, refined feel. The practical zip opening makes it a convenient makeup organiser and travel cosmetic bag.\n\nHandmade with careful attention to detail and the distinctive Nikky’S touch.",
      men: "Staying organised saves time and makes every departure easier. The Nikky’S men’s toiletry bag keeps a razor, toothbrush, toothpaste, deodorant and daily grooming essentials together, organised and within easy reach. It is a practical choice for home, the gym, business travel or a weekend away.\n\nTextured quilted eco leather combines a clean look with everyday practicality, a 3 mm foam layer helps the bag retain its shape, and the American satin lining gives the interior a smooth, precise finish. This compact men’s wash bag keeps luggage organised and small essentials from getting scattered.\n\nHandmade by Nikky’S for greater order, convenience and confidence at home and while travelling.",
    },
    dimensions: "20 × 11 × 11 cm (L × H × W)",
    materials: "Quilted eco leather · 3 mm foam · American satin · Zipper",
  },
  2: {
    name: "Mini Bag Nikky’S",
    category: "Bags",
    description: "A compact bag for the days when you only want to carry the essentials — your phone, keys, mini wallet and a few small cosmetics. Wear it comfortably over the shoulder with the long strap, or attach the short removable strap and carry it on your wrist.\n\nThe exterior is made from textured quilted eco leather. A 3 mm foam layer adds softness and helps the bag keep its shape, while the American satin lining gives the interior a smooth, elegant finish.\n\nHandmade with metal details and the signature Nikky’S logo.",
    materials: "Quilted eco leather · 3 mm foam · American satin · Metal details · Zipper and metal Nikky’S logo",
  },
  5: {
    name: "Wrist bag Nikky’S",
    category: "Wrist bags",
    description: "A compact and comfortable bag for your everyday essentials. It holds a phone, wallet, keys and a few small cosmetics, while the practical strap lets you carry it securely on your wrist or use it as an organiser inside a larger bag.\n\nThe exterior is made from textured quilted eco leather. A 3 mm foam layer helps the bag retain its shape and adds extra softness. The interior is finished with smooth American satin for an elegant, refined feel.\n\nEvery piece is handmade with care and finished with the signature metal Nikky’S logo.",
    materials: "Quilted eco leather · 3 mm foam · American satin · Metal zipper and Nikky’S logo",
  },
  6: {
    name: "Mini wallet Nikky’S",
    category: "Mini wallets",
    description: "A compact wallet designed to organise your essentials without taking up unnecessary space. It is ideal for cards, folded banknotes, coins and other small personal items, while the two compartments keep everything easy to reach.\n\nThe exterior is made from textured quilted eco leather. The interior is finished with smooth American satin for a pleasant feel and a refined finish.\n\nEvery mini wallet is handmade with attention to detail and carries the signature metal Nikky’S logo.",
    materials: "Quilted eco leather · American satin · Zipper and metal Nikky’S logo",
  },
  7: {
    name: "Shoulder Bag Nikky’S",
    category: "Bags",
    description: "A practical shoulder bag with room for everything you need throughout the day — your phone, wallet, keys and favourite cosmetics. Comfortable handles and a clean silhouette make it easy to pair with both casual and more elegant looks. An interior zip pocket keeps smaller valuables secure and within easy reach.\n\nThe exterior is made from textured quilted eco leather. A 3 mm foam layer adds softness and structure, while the American satin lining completes the bag with a smooth, refined feel.\n\nHandmade with attention to detail and finished with the signature metal Nikky’S logo.",
    materials: "Quilted eco leather · 3 mm foam · American satin · Interior zip pocket · Metal zipper and Nikky’S logo",
  },
  8: {
    name: "Standard Satin Scrunchie Nikky’S",
    category: "Standard scrunchies",
    description: "A gentle finishing touch designed to fit effortlessly into your everyday style. The standard Nikky’S scrunchie is ideal for ponytails, buns and relaxed updos when you want comfortable hold with an elegant, understated look.\n\nSoft Russian satin glides delicately over the hair and feels pleasant throughout the day. Its 10–12 cm diameter creates just the right amount of volume without overpowering the hairstyle. Compact enough to keep in your handbag, it is a practical hair accessory for work, travel, casual outings and everyday moments when you want your hair to look beautifully put together with minimal effort.\n\nEvery satin scrunchie is handmade with attention to softness, shape and a precise finish.",
    dimensions: "Diameter: approximately 10–12 cm",
    materials: "Russian satin",
  },
  9: {
    name: "XL Satin Scrunchie Nikky’S",
    category: "XL scrunchies",
    description: "Designed to be noticed. The Nikky’S XL scrunchie adds volume and personality to even the simplest hairstyle, turning an everyday ponytail or bun into a complete look.\n\nA generous amount of soft Russian satin creates rich folds and a beautifully expressive silhouette. With a diameter of 16–18 cm, it is made for moments when the accessory becomes part of the outfit — from relaxed daytime styling to a special occasion. Wear it in your hair or around your wrist as a soft satin statement.\n\nEvery XL scrunchie is handmade to preserve its volume, softness and distinctive Nikky’S presence.",
    dimensions: "Diameter: approximately 16–18 cm",
    materials: "Russian satin",
  },
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("bg");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [orderProduct, setOrderProduct] = useState<Product | null>(null);
  const [orderColor, setOrderColor] = useState("");
  const [orderAudience, setOrderAudience] = useState<Audience>("women");
  const [orderImage, setOrderImage] = useState<string | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderAdded, setOrderAdded] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactProduct, setContactProduct] = useState("");
  const [contactKind, setContactKind] = useState<"enquiry" | "order" | "quick-order">("enquiry");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [deliveryMethod, setDeliveryMethod] = useState<"address" | "courier">("address");
  const [courier, setCourier] = useState<Courier | "">("");
  const [courierCity, setCourierCity] = useState("");
  const [courierLocation, setCourierLocation] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartItems, setCart] = useState<CartItem[]>([]);
  const cart = useMemo(() => applySecondProductDiscount(cartItems), [cartItems]);
  const [color, setColor] = useState("Кафяв");
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<Group | "Всички">("Всички");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0),
    [cart],
  );
  const discountTotal = useMemo(
    () => cart.reduce((sum, item) => sum + (item.discount ?? 0), 0),
    [cart],
  );
  const finalTotal = Math.max(0, total - discountTotal);
  const visibleProducts = filterProducts(products, activeGroup, activeSubcategory);
  const selectedAudience: Audience = activeGroup === "Мъжки аксесоари" ? "men" : "women";
  const selectedVariants =
    selected?.variantsByAudience?.[selectedAudience] ?? selected?.variants;
  const selectedImages =
    selectedVariants?.find((variant) => variant.name === color)?.images ??
    selected?.imagesByAudience?.[selectedAudience] ??
    selected?.images ??
    [];
  const currentImage = activeImage ?? selectedImages[0];
  const currentImageIndex = Math.max(0, selectedImages.indexOf(currentImage));
  const courierCities = useMemo(() => {
    if (!courier) return [];
    return [...new Set(courierLocations.filter((location) => location.carrier === courier).map((location) => location.city))]
      .sort((a, b) => a.localeCompare(b, "bg"))
      .map((city) => ({ value: city, label: city, search: city }));
  }, [courier]);
  const courierOfficeOptions = useMemo(() => {
    if (!courier || !courierCity) return [];
    return courierLocations
      .filter((location) => location.carrier === courier && location.city === courierCity)
      .map((location) => ({
        value: location.id,
        label: `${location.kind === "locker" ? (language === "bg" ? "Автомат" : "Locker") : (language === "bg" ? "Офис" : "Office")} ${location.code} · ${location.name}${location.address ? ` — ${location.address}` : ""}`,
        search: `${location.code} ${location.name} ${location.address} ${location.postCode}`,
      }));
  }, [courier, courierCity, language]);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("nikkys-language");
    if (savedLanguage === "en") setLanguage("en");

  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "bg"
      ? "Nikky’S — Ръчно изработени аксесоари"
      : "Nikky’S — Handmade accessories";
    document.querySelector('meta[name="description"]')?.setAttribute(
      "content",
      language === "bg"
        ? "Несесери, чанти и аксесоари от капитонирана кожа, създадени на ръка с внимание към всеки детайл."
        : "Handmade toiletry bags, handbags and accessories in quilted eco leather, created with care for every detail.",
    );
    window.localStorage.setItem("nikkys-language", language);
  }, [language]);

  useEffect(() => {
    if (!storyOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStoryOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [storyOpen]);

  useEffect(() => {
    if (!upsellOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUpsellOpen(false);

      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [upsellOpen]);

  const text = (bg: string, en: string) => language === "bg" ? bg : en;
  const translate = (value: string) => language === "bg" ? value : (englishText[value] ?? value);
  const productText = (product: Product, field: "name" | "category" | "description" | "dimensions" | "materials") => {
    if (language === "bg") return product[field];
    return productEnglish[product.id]?.[field] ?? product[field];
  };
  const productDescription = (product: Product) => {
    const audience = activeGroup === "Мъжки аксесоари" ? "men" : "women";
    const localisedProduct = language === "bg" ? product : (productEnglish[product.id] ?? product);
    return localisedProduct.descriptions?.[audience] ?? productText(product, "description");
  };
  const productGroupText = (product: Product) => {
    if (!Array.isArray(product.group)) return translate(product.group);
    if (activeGroup !== "Всички" && product.group.includes(activeGroup)) return translate(activeGroup);
    return text("Дамски и мъжки аксесоари", "Women’s and men’s accessories");
  };

  function toggleLanguage() {
    setLanguage((current) => current === "bg" ? "en" : "bg");
  }

  function showGalleryImage(direction: -1 | 1) {
    if (selectedImages.length < 2) return;
    const nextIndex = (currentImageIndex + direction + selectedImages.length) % selectedImages.length;
    setActiveImage(selectedImages[nextIndex]);
  }

  function addToCart(product: Product, chosenColor: string, quantity: number, image?: string) {
    setCart((items) => {
      // Merge only consecutive additions to preserve the order of eligible units.
      const last = items[items.length - 1];
      if (last && last.id === product.id && last.color === chosenColor && last.image === image && last.price === product.price) {
        return [...items.slice(0, -1), { ...last, quantity: last.quantity + quantity }];
      }
      return [...items, { ...product, color: chosenColor, quantity, image }];
    });
    setOrderAdded(true);
    setOrderQuantity(1);
    if (cart.length === 0 && isPromotionEligible(product) && quantity === 1) setUpsellOpen(true);
  }

  function chooseGroup(group: Group | "Всички", subcategory: string | null = null) {
    setActiveGroup(group);
    setActiveSubcategory(subcategory);
    setMenuOpen(false);
    window.setTimeout(() => document.getElementById("new")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  function openContactForm(kind: "enquiry" | "order" | "quick-order", product = "") {
    setContactKind(kind);
    setContactProduct(product);
    setContactStatus("idle");
    if (kind === "order") {
      setDeliveryMethod("address");
      setCourier("");
      setCourierCity("");
      setCourierLocation("");
    }
    setContactOpen(false);
    setContactFormOpen(true);
  }

  async function submitContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (contactKind === "order" && deliveryMethod === "courier" && (!courier || !courierCity || !courierLocation)) {
      setContactStatus("error");
      return;
    }
    setContactStatus("sending");
    const submittedForm = event.currentTarget;
    const form = new FormData(submittedForm);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, language, kind: contactKind, product: contactProduct, deliveryMethod, courier, courierCity, courierLocation }),
    }).catch(() => null);
    setContactStatus(response?.ok ? "sent" : "error");
    if (response?.ok) submittedForm.reset();
  }

  return (
    <main>
      <div className="announcement">
        {text("Доставка в България · Ръчно изработено с внимание", "Delivery in Bulgaria · Handmade with care")}
      </div>
      <header className="site-header">
        <button
          className="icon-button menu-button"
          aria-label={text("Отвори меню", "Open menu")}
          onClick={() => setMenuOpen(true)}
        >
          <Menu />
        </button>
        <a className="wordmark" href="#home">
          Nikky<span>’</span>S
        </a>
        <nav className="desktop-nav">
          <button type="button" onClick={() => setMenuOpen(true)}>{text("Категории", "Categories")}</button>
          <a href="#new">{text("Ново", "New")}</a>
          <a href="#story">{text("За Nikky’S", "About Nikky’S")}</a>
          <a href="#custom" onClick={(event) => { event.preventDefault(); chooseGroup(customCategoryName); }}>{text("По поръчка", "Custom made")}</a>
        </nav>
        <button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={text("Премини на английски", "Switch to Bulgarian")}>
          <span className={language === "bg" ? "active" : ""}>BG</span>
          <i />
          <span className={language === "en" ? "active" : ""}>EN</span>
        </button>
        <button className="bag-button" onClick={() => setCartOpen(true)}>
          <ShoppingBag size={20} />
          <span className="desktop-label">{text("Количка", "Bag")}</span>
          <b>{cart.reduce((count, item) => count + item.quantity, 0)}</b>
        </button>
      </header>
      {menuOpen && <div className="menu-backdrop" onMouseDown={() => setMenuOpen(false)}><aside className="side-menu" onMouseDown={(event) => event.stopPropagation()} aria-label={text("Основно меню", "Main menu")}><div className="side-menu-head"><a className="wordmark" href="#home" onClick={() => setMenuOpen(false)}>Nikky<span>’</span>S</a><button className="close" aria-label={text("Затвори меню", "Close menu")} onClick={() => setMenuOpen(false)}><X /></button></div><p className="menu-title">{text("Категории", "Categories")}</p><nav className="category-menu">{groups.map((group) => group.subcategories.length ? <details key={group.name}><summary><span>{translate(group.name)}</span><ChevronDown size={18}/></summary><div className="submenu">{group.subcategories.map((subcategory) => subcategory.children ? <details key={subcategory.name}><summary><span>{translate(subcategory.name)}</span><ChevronDown size={16}/></summary><div className="third-menu"><button type="button" onClick={()=>chooseGroup(group.name, subcategory.name)}>{text("Всички продукти", "All products")}</button>{subcategory.children.map((child)=><button type="button" key={child} onClick={()=>chooseGroup(group.name, child)}>{translate(child)}</button>)}</div></details> : <button type="button" key={subcategory.name} onClick={()=>chooseGroup(group.name, subcategory.name)}>{translate(subcategory.name)}</button>)}</div></details> : <button type="button" className="direct-category" key={group.name} onClick={()=>chooseGroup(group.name)}>{translate(group.name)}<ArrowRight size={17}/></button>)}</nav><div className="side-links"><a href="#new" onClick={() => setMenuOpen(false)}>{text("Ново", "New")}</a><a href="#story" onClick={() => setMenuOpen(false)}>{text("За Nikky’S", "About Nikky’S")}</a><a href="#custom" onClick={(event) => { event.preventDefault(); chooseGroup(customCategoryName); }}>{text("По поръчка", "Custom made")}</a></div></aside></div>}

      <section className="hero" id="home">
        <div className="hero-copy">
          <p className="eyebrow">{text("Ръчно създадено · С внимание", "Handmade · With care")}</p>
          <h1>
            {text("Красивото живее", "Beauty lives")}
            <br />{text("в малките неща.", "in the little things.")}
          </h1>
          <p>
            {text("Несесери, чанти и аксесоари от капитонирана кожа, създадени бавно и с мисъл за твоето ежедневие.", "Toiletry bags, handbags and accessories in quilted eco leather, thoughtfully made for your everyday life.")}
          </p>
          <button className="primary-button" type="button" onClick={() => setMenuOpen(true)}>
            {text("Разгледай колекцията", "Explore the collection")} <ArrowRight size={17} />
          </button>
        </div>
        <div
          className="hero-image"
          role="img"
          aria-label={text("Две приятелки с черна мини чанта за рамо, сива чанта за китка и червено скрънчи Nikky’S", "Two friends with a black mini shoulder bag, a grey wrist bag and a red Nikky’S scrunchie")}
        />
      </section>

      <section className="section products-section" id="new">
        <div className="group-tabs" aria-label={text("Филтриране по колекция", "Filter by collection")}>
          {["Всички", ...groups.map((group) => group.name)].map((group) => (
            <button
              type="button"
              className={activeGroup === group ? "active" : ""}
              onClick={() => chooseGroup(group as Group | "Всички")}
              key={group}
            >
              {group === "Всички" ? text("Всички", "All") : translate(group)}
            </button>
          ))}
        </div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">{text("Нова колекция", "New collection")}</p>
            <h2>{activeSubcategory ? translate(activeSubcategory) : activeGroup === "Всички" ? text("Избрани за теб", "Selected for you") : translate(activeGroup)}</h2>
            {activeSubcategory && <p className="subcategory-context">{translate(activeGroup)}</p>}
          </div>
          <button
            className="view-all"
            type="button"
            onClick={() => chooseGroup("Всички")}
          >
            {text("Виж всички", "View all")} <ArrowRight size={16} />
          </button>
        </div>
        {activeGroup === customCategoryName ? (
          <CustomGallery language={language} onEnquiry={() => setContactOpen(true)} />
        ) : (
        <div className="product-grid" id="shop">
          {!visibleProducts.length && <p className="empty-subcategory">{text("Скоро ще добавим продукти в тази подкатегория.", "Products in this subcategory are coming soon.")}</p>}
          {visibleProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <button
                className="product-visual"
                onClick={() => {
                  const productAudience: Audience = activeGroup === "Мъжки аксесоари" ? "men" : "women";
                  const productVariants = product.variantsByAudience?.[productAudience] ?? product.variants;
                  const productImages = product.imagesByAudience?.[productAudience] ?? product.images;
                  const initialColor = product.colors?.[0]?.name ?? product.color;
                  const initialVariant = productVariants?.find((variant) => variant.name === initialColor);
                  setSelected(product);
                  setColor(initialColor);
                  setActiveImage(initialVariant?.images[0] ?? productImages?.[0] ?? null);
                }}
              >
                {product.images ? (
                  <img src={(product.imagesByAudience?.[activeGroup === "Мъжки аксесоари" ? "men" : "women"] ?? product.images)[0]} alt={`${productText(product, "name")} ${text("от капитонирана кожа", "in quilted eco leather")}`} />
                ) : (
                  <span
                    className="product-object"
                    style={
                      {
                        "--tone": product.tone,
                        "--scale": `${1 - product.id * 0.035}`,
                      } as React.CSSProperties
                    }
                  >
                    <i />
                  </span>
                )}
                {product.id === 1 && <span className="badge">{text("Ново", "New")}</span>}
                <Heart className="heart" size={20} />
              </button>
              <div className="product-meta">
                <div>
                  <p>{productGroupText(product)}</p>
                  <h3>{productText(product, "name")}</h3>
                </div>
                {product.price !== null && <strong>€{product.price.toFixed(2)}</strong>}
              </div>
            </article>
          ))}
        </div>
        )}
      </section>

      <section className="feeling">
        <div>
          <p className="eyebrow">{text("Създадено за всеки ден", "Made for every day")}</p>
          <h2>
            {text("Място за малките неща,", "Room for the little things")}
            <br />
            {text("които винаги са с теб.", "you always carry with you.")}
          </h2>
          <p>
            {text("Портфейл, ключове и любимата козметика — подредени красиво и винаги под ръка.", "Your wallet, keys and favourite cosmetics — beautifully organised and always close at hand.")}
          </p>
        </div>
      </section>

      <section className="craft" id="story">
        <img
          src="/images/nikkys-process-v2.jpg"
          alt={text("Ръчна изработка в ателието на Nikky’S", "Handcrafting in the Nikky’S studio")}
        />
        <div className="craft-copy">
          <p className="eyebrow">{text("Всяка бройка има история", "Every piece has a story")}</p>
          <h2>
            {text("Направено на ръка.", "Made by hand.")}
            <br />
            {text("Създадено с усещане.", "Created with feeling.")}
          </h2>
          <p>
            {text("За мен шиенето е момент на спокойствие, свобода и пълна концентрация. Във всеки продукт влагам време, внимание и част от себе си — затова две бройки никога не са напълно еднакви.", "For me, sewing is a moment of calm, freedom and complete focus. I put time, care and a part of myself into every product — which is why no two pieces are ever exactly alike.")}
          </p>
          <button className="story-link" type="button" onClick={() => setStoryOpen(true)}>
            {text("Историята на Nikky’S", "The Nikky’S story")} <ArrowRight size={17} />
          </button>
        </div>
      </section>
      <section className="values">
        <div>
          <Check />
          <h3>{text("Ръчна изработка", "Handmade")}</h3>
          <p>{text("Всяка бройка е създадена индивидуално.", "Every piece is individually made.")}</p>
        </div>
        <div>
          <Heart />
          <h3>{text("С внимание", "Made with care")}</h3>
          <p>{text("Подбрани материали и прецизни детайли.", "Carefully selected materials and precise details.")}</p>
        </div>
        <div>
          <ShoppingBag />
          <h3>{text("Лична поръчка", "Custom order")}</h3>
          <p>{text("Възможност за твой цвят и комбинация.", "Choose your own colour and combination.")}</p>
        </div>
      </section>
      <footer>
        <a className="wordmark" href="#home">
          Nikky<span>’</span>S
        </a>
        <p>{text("Ръчно изработени малки неща за красивото ежедневие.", "Handmade little things for a beautiful everyday life.")}</p>
        <div>
          <a href="#shop">{text("Магазин", "Shop")}</a>
          <a href="#story">{text("За нас", "About")}</a>
          <a href="#custom" onClick={(event) => { event.preventDefault(); chooseGroup(customCategoryName); }}>{text("Контакт", "Contact")}</a>
          <button
            type="button"
            className="social-link"
            onClick={() => window.location.assign("https://www.instagram.com/nikkyshandmade/")}
            aria-label={text("Отвори Instagram профила", "Open Instagram profile")}
          >
            Instagram <ArrowRight size={14} />
          </button>
          <button
            type="button"
            className="social-link"
            onClick={() => window.location.assign("https://www.facebook.com/share/1FSakmJg3y/?mibextid=wwXIfr")}
            aria-label={text("Отвори Facebook страницата", "Open Facebook page")}
          >
            Facebook <ArrowRight size={14} />
          </button>
        </div>
        <nav className="footer-legal" aria-label={text("Информация и политики", "Information and policies")}>
          <h2>{text("Политики и полезна информация", "Policies & useful information")}</h2>
          <a href={`/policies/delivery?lang=${language}`}>{text("Плащане и доставка", "Payment & delivery")}</a>
          <a href={`/policies/returns?lang=${language}`}>{text("Връщане и рекламации", "Returns & complaints")}</a>
          <a href={`/policies/terms?lang=${language}`}>{text("Общи условия", "Terms & conditions")}</a>
          <a href={`/policies/privacy?lang=${language}`}>{text("Лични данни", "Privacy policy")}</a>
          <a href={`/policies/cookies?lang=${language}`}>{text("Бисквитки", "Cookies")}</a>
          <button type="button" onClick={() => window.dispatchEvent(new Event("nikkys-cookie-settings"))}>{text("Настройки на бисквитките", "Cookie settings")}</button>
        </nav>
        <small>© 2026 Nikky’S. {text("Всички права запазени.", "All rights reserved.")}</small>
      </footer>

      {storyOpen && <div className="overlay story-overlay" onMouseDown={() => setStoryOpen(false)}>
        <button className="close story-close" type="button" aria-label={text("Затвори", "Close")} onClick={() => setStoryOpen(false)}><X /></button>
        <article className="story-modal" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="story-title">
          <div className="story-modal-image" role="img" aria-label={text("Ръчна изработка в ателието на Nikky’S", "Handcrafting in the Nikky’S studio")} />
          <div className="story-modal-copy">
            <h2 id="story-title">{text("Историята на Nikky’S", "The story of Nikky’S")}</h2>
            <div className="story-text">
              <p>{text("Понякога най-хубавите неща започват съвсем неочаквано.", "Sometimes the most beautiful things begin completely unexpectedly.")}</p>
              <p>{text("Историята на Nikky’S започна не с идея за бранд, а с една табуретка и желанието ми сам да ушия красив калъф за нея. Докато опитвах, поправях и се стремях всеки следващ шев да бъде по-добър, открих нещо, което истински ме кара да се чувствам на мястото си — шиенето.", "Nikky’S did not begin with the idea of creating a brand. It began with a stool and my wish to sew a beautiful cover for it myself. As I tried, adjusted and worked to make every new seam better, I discovered something that truly made me feel at home — sewing.")}</p>
              <p>{text("След първия калъф дойдоха несесерите, чантите, калъфите за лаптопи и възглавниците. С времето разбрах, че най-много обичам да създавам несесери и чанти — красиви и практични малки неща, които внасят повече подреденост и настроение в ежедневието.", "After that first cover came toiletry bags, handbags, laptop sleeves and cushions. In time, I realised that what I loved most was creating toiletry bags and handbags — beautiful, practical little things that bring more order and joy to everyday life.")}</p>
              <p>{text("Така се роди Nikky’S. Днес всеки модел преминава през ръцете ми — от избора на материята до последния шев и малкото метално лого. Във всеки продукт влагам време, внимание и част от себе си, за да стигне до теб нещо, създадено с истинско желание.", "That is how Nikky’S was born. Today, every design passes through my hands — from choosing the material to the final stitch and the little metal logo. I put time, care and a part of myself into every piece, so that something made with genuine passion can find its way to you.")}</p>
              <p>{text("Защото красотата може да бъде и в малките неща, които носиш със себе си всеки ден.", "Because beauty can live in the little things you carry with you every day.")}</p>
            </div>
            <button className="primary-button story-cta" type="button" onClick={() => { setStoryOpen(false); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); }}>
              {text("Открий своя модел", "Find your design")} <ArrowRight size={17} />
            </button>
          </div>
        </article>
      </div>}
      {selected && (
        <div className="overlay" onMouseDown={() => setSelected(null)}>
          <section
            className="product-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button className="close" onClick={() => setSelected(null)} aria-label={text("Затвори", "Close")}>
              <X />
            </button>
            <div className="modal-visual">{selectedImages.length ? <><div className="gallery-stage"><img className="gallery-main" src={currentImage} alt={productText(selected, "name")}/>{selectedImages.length > 1 && <><button type="button" className="gallery-arrow gallery-arrow-prev" onClick={()=>showGalleryImage(-1)} aria-label={text("Предишна снимка", "Previous image")}><ArrowLeft size={20}/></button><button type="button" className="gallery-arrow gallery-arrow-next" onClick={()=>showGalleryImage(1)} aria-label={text("Следваща снимка", "Next image")}><ArrowRight size={20}/></button><span className="gallery-count" aria-live="polite">{currentImageIndex + 1} / {selectedImages.length}</span></>}</div><div className="gallery-thumbs">{selectedImages.map((image,index)=><button type="button" className={currentImage===image?"active":""} onClick={()=>setActiveImage(image)} key={image}><img src={image} alt={`${productText(selected, "name")} — ${text("снимка", "image")} ${index+1}`}/></button>)}</div></> : <span className="product-object large" style={{ "--tone": selected.tone } as React.CSSProperties}><i /></span>}</div>
            <div className="modal-copy">
              <p className="eyebrow">{productText(selected, "category")}</p>
              <h2>{productText(selected, "name")}</h2>
              {selected.price !== null && <strong>€{selected.price.toFixed(2)}</strong>}
              <p>{productDescription(selected) ?? text("Практичен ръчно изработен модел от мека капитонирана кожа, с чист силует, фина подплата и метален цип.", "A practical handmade design in soft quilted eco leather, with a clean silhouette, refined lining and metal zipper.")}</p>
              {selected.colors?.length !== 0 && <fieldset>
                <legend>
                  {text("Цвят", "Colour")}: <b>{translate(color)}</b>
                </legend>
                <div className="swatches">
                  {(selected.colors ?? [
                    ["Кафяв", "#4a3025"],
                    ["Черно", "#292724"],
                    ["Сиво", "#88857f"],
                    ["Сиво-бежово", "#aaa092"],
                  ]).map((option) => {
                    const [name, tone] = Array.isArray(option) ? option : [option.name, option.tone];
                    return (
                    <button
                      key={name}
                      aria-label={translate(name)}
                      className={color === name ? "active" : ""}
                      style={{ background: tone }}
                      onClick={() => {
                        setColor(name);
                        const variant = selectedVariants?.find((item) => item.name === name);
                        if (variant) setActiveImage(variant.images[0]);
                      }}
                    />
                  )})}
                </div>
              </fieldset>}
              <div className="details">
                <span>{text("Размери", "Dimensions")}</span>
                <b>{productText(selected, "dimensions") ?? text("Очаквайте", "Coming soon")}</b>
                <span>{text("Материали", "Materials")}</span>
                <b>{productText(selected, "materials") ?? text("Ще бъдат добавени", "To be added")}</b>
              </div>
              <button className="primary-button full" type="button" onClick={() => { setOrderProduct(selected); setOrderColor(color); setOrderAudience(selectedAudience); setOrderImage(currentImage); setOrderQuantity(1); setOrderAdded(false); setSelected(null); }}>{text("Поръчай", "Order")} <ArrowRight size={17}/></button>
            </div>
          </section>
        </div>
      )}
      {orderProduct && <div className="overlay" onMouseDown={() => setOrderProduct(null)}>
        <section className="order-choice" role="dialog" aria-modal="true" aria-labelledby="order-choice-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="close" type="button" aria-label={text("Затвори", "Close")} onClick={() => setOrderProduct(null)}><X /></button>
          {orderImage && <img className="order-choice-image" src={orderImage} alt={`${productText(orderProduct, "name")} — ${translate(orderColor)}`} />}
          <div className="order-choice-copy">
            <p className="eyebrow">{text("Твоят избор", "Your selection")}</p>
            <h2 id="order-choice-title">{productText(orderProduct, "name")}</h2>
            {orderProduct.colors && orderProduct.colors.length > 0 && <fieldset className="order-colors">
              <legend>{text("Цвят", "Colour")}: <strong>{translate(orderColor)}</strong></legend>
              <div className="order-color-options">
                {orderProduct.colors.map(({ name, tone }) => <button key={name} type="button" className={orderColor === name ? "active" : ""} aria-pressed={orderColor === name} onClick={() => {
                  const variants = orderProduct.variantsByAudience?.[orderAudience] ?? orderProduct.variants;
                  const firstImage = variants?.find((variant) => variant.name === name)?.images[0] ?? orderProduct.imagesByAudience?.[orderAudience]?.[0] ?? orderProduct.images?.[0] ?? null;
                  setOrderColor(name);
                  setOrderImage(firstImage);
                  setOrderQuantity(1);
                  setOrderAdded(false);
                }}><span className="order-color-dot" style={{ backgroundColor: tone }} />{translate(name)}</button>)}
              </div>
            </fieldset>}
            <div className="order-quantity">
              <span>{text("Количество", "Quantity")}</span>
              <div className="quantity-picker">
                <button type="button" aria-label={text("Намали количеството", "Decrease quantity")} disabled={orderQuantity === 1} onClick={() => setOrderQuantity((value) => Math.max(1, value - 1))}>−</button>
                <output aria-live="polite">{orderQuantity}</output>
                <button type="button" aria-label={text("Увеличи количеството", "Increase quantity")} disabled={orderQuantity === 99} onClick={() => setOrderQuantity((value) => Math.min(99, value + 1))}>+</button>
              </div>
            </div>
            {orderProduct.price !== null && <div className="order-choice-total"><span>€{orderProduct.price.toFixed(2)} / {text("брой", "item")}</span><strong>{text("Общо", "Total")}: €{(orderProduct.price * orderQuantity).toFixed(2)}</strong></div>}
            <button className="primary-button full" type="button" onClick={() => addToCart(orderProduct, orderColor, orderQuantity, orderImage ?? undefined)}>{text("Добави в количката", "Add to bag")} <ShoppingBag size={17} /></button>
            {orderAdded && <p className="order-added" role="status">{text("Добавено в количката. Можеш да избереш и друг цвят.", "Added to your bag. You can choose another colour.")}</p>}
            {cart.length > 0 && <button className="order-view-cart" type="button" onClick={() => { setOrderProduct(null); setCartOpen(true); }}>{text("Прегледай количката", "View bag")} ({cart.reduce((count, item) => count + item.quantity, 0)}) <ArrowRight size={17} /></button>}
          </div>
        </section>
      </div>}
      {upsellOpen && <div className="upsell-overlay" onMouseDown={() => { setUpsellOpen(false); }}>
        <section className="upsell-card" role="dialog" aria-modal="true" aria-labelledby="upsell-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="close" type="button" aria-label={text("Затвори предложението", "Close offer")} onClick={() => { setUpsellOpen(false); }}><X /></button>
          <p className="eyebrow">{text("Специално предложение", "Special offer")}</p>
          <h2 id="upsell-title">{text("Добави втори продукт от еко кожа и получи −15% за него", "Add a second eco-leather product and get 15% off it")}</h2>
          <p>{text("Предложението е по желание — можеш спокойно да продължиш само с избрания продукт. Първият продукт в количката трябва да е от еко кожа. Скрънчитата не получават отстъпка и се пропускат при броенето на следващите продукти. −15% се прилага автоматично само за втората бройка от еко кожа.", "The offer is optional — you can continue with only the product you selected. The first item in your basket must be made from eco leather. Scrunchies receive no discount and are skipped when counting subsequent items. 15% off applies automatically to the second eco-leather unit only.")}</p>
          <div className="upsell-actions">
            <button className="primary-button" type="button" onClick={() => { setUpsellOpen(false); setOrderProduct(null); setOrderAdded(false); setActiveGroup("Всички"); setActiveSubcategory(null); window.setTimeout(() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }), 0); }}>
              {text("Добави втори продукт", "Add a second product")} <ArrowRight size={17} />
            </button>
            <button className="upsell-decline" type="button" onClick={() => { setUpsellOpen(false); }}>{text("Не, благодаря", "No, thank you")}</button>
          </div>
        </section>
      </div>}
      {cartOpen && (
        <div
          className="overlay cart-overlay"
          onMouseDown={() => setCartOpen(false)}
        >
          <aside className="cart" onMouseDown={(e) => e.stopPropagation()}>
            <div className="cart-head">
              <h2>{text("Твоята количка", "Your bag")}</h2>
              <button className="close" onClick={() => setCartOpen(false)} aria-label={text("Затвори", "Close")}>
                <X />
              </button>
            </div>
            {cart.length === 0 ? (
              <div className="empty">
                <ShoppingBag />
                <h3>{text("Количката е празна", "Your bag is empty")}</h3>
                <p>{text("Разгледай колекцията и открий своя модел.", "Explore the collection and find your design.")}</p>
                <button
                  className="primary-button"
                  onClick={() => setCartOpen(false)}
                >
                  {text("Към магазина", "Go to shop")}
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, i) => (
                    <div className="cart-item" key={`${item.id}-${i}`}>
                      {item.image ? <img className="cart-thumb" src={item.image} alt="" /> : <span className="cart-thumb" style={{ background: item.tone }} />}
                      <div>
                        <h3>{productText(item, "name")}</h3>
                        <p>{translate(item.color)}</p>
                        <p>{text("Количество", "Quantity")}: {item.quantity}</p>
                        <strong>{item.price === null ? text("Цена предстои", "Price coming soon") : `€${(item.price * item.quantity).toFixed(2)}`}</strong>
                        {(item.discount ?? 0) > 0 && <p className="item-discount">{text("Отстъпка за втори продукт", "Second product discount")}: −€{item.discount!.toFixed(2)}</p>}
                      </div>
                      <button
                        aria-label={text("Премахни продукта", "Remove item")}
                        onClick={() => setCart((items) => items.filter((_, n) => n !== i))}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div><span>{text("Междинна сума", "Subtotal")}</span><strong>{cart.some((item) => item.price === null) ? text("Цена предстои", "Price coming soon") : `€${total.toFixed(2)}`}</strong></div>
                  {discountTotal > 0 && <div className="cart-discount"><span>{text("Отстъпка −15% за втория продукт", "15% off the second product")}</span><strong>−€{discountTotal.toFixed(2)}</strong></div>}
                  <div className="cart-final"><span>{text("Общо", "Total")}</span><strong>{cart.some((item) => item.price === null) ? text("Цена предстои", "Price coming soon") : `€${finalTotal.toFixed(2)}`}</strong></div>
                </div>
                <button className="primary-button full" type="button" onClick={() => { const itemsSummary = cart.map(item => `${productText(item, "name")} — ${translate(item.color)} × ${item.quantity}`).join("; "); const discountSummary = discountTotal > 0 && cart.every(item => item.price !== null) ? `; ${text("Отстъпка −15% за втория продукт", "15% off the second product")}: −€${discountTotal.toFixed(2)}; ${text("Крайна сума", "Final total")}: €${finalTotal.toFixed(2)}` : ""; setCartOpen(false); openContactForm("order", `${itemsSummary}${discountSummary}`); }}>
                  {text("Завърши поръчката", "Complete order")} <ArrowRight size={17} />
                </button>
                <small>{text("Доставката се изчислява при завършване.", "Delivery is calculated at checkout.")}</small>
              </>
            )}
          </aside>
        </div>
      )}
      {contactOpen && <div className="overlay" onMouseDown={() => setContactOpen(false)}>
        <section className="contact-choice" onMouseDown={(event) => event.stopPropagation()}>
          <button className="close" type="button" aria-label={text("Затвори", "Close")} onClick={() => setContactOpen(false)}><X /></button>
          <p className="eyebrow">{text("Свържи се с Nikky’S", "Contact Nikky’S")}</p>
          <h2>{text("Как предпочиташ да се свържеш?", "How would you like to get in touch?")}</h2>
          <div className="contact-options">
            <a href="tel:+359896253141"><Phone /><span><b>{text("По телефона", "By phone")}</b><small>0896 253 141</small></span><ArrowRight /></a>
            <a href="mailto:nikkyshandmade@gmail.com"><Mail /><span><b>{text("По имейл", "By email")}</b><small>nikkyshandmade@gmail.com</small></span><ArrowRight /></a>
            <button type="button" onClick={() => openContactForm("enquiry")}><MessageSquare /><span><b>{text("Запитване през сайта", "Enquiry through the website")}</b><small>{text("Ще отговоря на посочения имейл", "I will reply to the email you provide")}</small></span><ArrowRight /></button>
          </div>
        </section>
      </div>}
      {contactFormOpen && <div className="overlay" onMouseDown={() => setContactFormOpen(false)}>
        <section className="contact-form-card" onMouseDown={(event) => event.stopPropagation()}>
          {contactKind === "order" && <button className="quick-order-button" type="button" onClick={() => { setContactKind("quick-order"); setContactStatus("idle"); }}>
            {text("Бърза поръчка", "Quick order")}
          </button>}
          <button className="close" type="button" aria-label={text("Затвори", "Close")} onClick={() => setContactFormOpen(false)}><X /></button>
          <p className="eyebrow">{contactKind === "quick-order" ? text("Бърза поръчка", "Quick order") : contactKind === "order" ? text("Поръчка", "Order") : text("Запитване", "Enquiry")}</p>
          <h2>{contactKind === "quick-order" ? text("Само име и телефон", "Just your name and phone") : contactKind === "order" ? text("Завърши поръчката", "Complete your order") : text("Разкажи ми за идеята си", "Tell me about your idea")}</h2>
          {contactProduct && <p className="contact-product">{contactProduct}</p>}
          {(contactKind === "order" || contactKind === "quick-order") && <div className="checkout-summary">
            <p><strong>{text("Начин на плащане", "Payment method")}:</strong> {text("Наложен платеж", "Cash on delivery")}</p>
            <p>{text("Срок за изработка: 3 дни след потвърждаване на поръчката. Доставка: още 2 дни.", "Production time: 3 days after order confirmation. Delivery: a further 2 days.")}</p>
          </div>}
          {contactStatus === "sent" ? <div className="form-success"><Check /><h3>{contactKind === "quick-order" ? text("Бързата поръчка е изпратена.", "Your quick order has been sent.") : text("Съобщението е изпратено.", "Your message has been sent.")}</h3><p>{text("Ще се свържем с Вас възможно най-скоро.", "We will contact you as soon as possible.")}</p></div> : <form className={contactKind === "order" ? "order-form" : contactKind === "quick-order" ? "quick-order-form" : undefined} onSubmit={submitContact}>
            {contactKind === "order" || contactKind === "quick-order"
              ? <label>{text("Име *", "First name *")}<input name="firstName" required autoComplete="given-name" /></label>
              : <label>{text("Име", "Name")}<input name="name" required autoComplete="name" /></label>}
            {contactKind !== "quick-order" && <label>{text("Имейл *", "Email *")}<input name="email" type="email" required autoComplete="email" /></label>}
            <label>{contactKind === "order" || contactKind === "quick-order" ? text("Телефон *", "Phone *") : text("Телефон", "Phone")}<input name="phone" type="tel" required={contactKind === "order" || contactKind === "quick-order"} autoComplete="tel" /></label>
            {contactKind === "quick-order" && <p className="quick-order-message">{text("Ние ще се свържем с Вас.", "We will contact you.")}</p>}
            {contactKind === "order" && <fieldset className="order-address delivery-choice">
              <legend>{text("Доставка", "Delivery")}</legend>
              <div className="delivery-methods">
                <button type="button" className={deliveryMethod === "address" ? "active" : ""} onClick={() => setDeliveryMethod("address")}>{text("До адрес", "To address")}</button>
                <button type="button" className={deliveryMethod === "courier" ? "active" : ""} onClick={() => setDeliveryMethod("courier")}>{text("До офис", "To office")}</button>
              </div>
              {deliveryMethod === "address" ? <div className="order-address-grid">
                  <label>{text("Град", "City")}<input name="city" autoComplete="address-level2" /></label>
                  <label>{text("Квартал", "District")}<input name="district" autoComplete="address-level3" /></label>
                  <div className="address-street-row address-wide">
                    <label>{text("Улица", "Street")}<input name="street" autoComplete="address-line1" /></label>
                    <label>{text("Номер", "Number")}<input name="streetNumber" /></label>
                  </div>
                  <label className="address-wide">{text("Блок", "Building / block")}<input name="block" /></label>
                  <label>{text("Вход", "Entrance")}<input name="entrance" /></label>
                  <label>{text("Етаж", "Floor")}<input name="floor" /></label>
                  <label>{text("Апартамент", "Apartment")}<input name="apartment" /></label>
                </div> : <div className="courier-picker">
                  <p>{text("Избери куриер", "Choose a courier")}</p>
                  <div className="courier-buttons">
                    {(["econt", "speedy", "boxnow"] as Courier[]).map((item) => <button type="button" key={item} className={courier === item ? "active" : ""} onClick={() => { setCourier(item); setCourierCity(""); setCourierLocation(""); }}>
                      {courierNames[item]}
                    </button>)}
                  </div>
                  <SearchDropdown label={text("Град", "City")} placeholder={text("Избери град", "Choose a city")} searchPlaceholder={text("Търси град…", "Search city…")} value={courierCity} options={courierCities} disabled={!courier} onChange={(value) => { if (value !== courierCity) { setCourierCity(value); setCourierLocation(""); } }} />
                  <SearchDropdown label={text("Офис или автомат", "Office or locker")} placeholder={text("Избери офис или автомат", "Choose an office or locker")} searchPlaceholder={text("Търси по име, адрес или код…", "Search by name, address or code…")} value={courierLocation} options={courierOfficeOptions} disabled={!courierCity} onChange={setCourierLocation} />
                </div>}
            </fieldset>}
            {contactKind !== "quick-order" && <label>{contactKind === "order" ? text("Допълнителна информация", "Additional information") : text("Съобщение", "Message")}<textarea name="message" required={contactKind === "enquiry"} rows={5} /></label>}
            <div className="form-legal">
              <p>{text("Използваме данните, за да отговорим и да обработим заявката ти. Това не е съгласие за реклама.", "We use your details to respond and handle your request. This does not subscribe you to marketing.")} <a href={`/policies/privacy?lang=${language}`} target="_blank" rel="noopener noreferrer">{text("Как защитаваме личните данни", "How we handle personal data")}</a></p>
              {contactKind === "order" && <label className="terms-checkbox"><input type="checkbox" name="termsAccepted" required /><span>{text("Приемам", "I accept the")} <a href={`/policies/terms?lang=${language}`} target="_blank" rel="noopener noreferrer">{text("Общите условия", "Terms & conditions")}</a> {text("и се запознах с", "and have read the")} <a href={`/policies/returns?lang=${language}`} target="_blank" rel="noopener noreferrer">{text("условията за връщане и рекламация", "Returns & complaints policy")}</a>. *</span></label>}
            </div>
            <input className="honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {contactStatus === "error" && <p className="form-error">{text("Съобщението не беше изпратено. Опитай отново или използвай телефона и имейла.", "The message could not be sent. Please try again or use phone or email.")}</p>}
            <button className="primary-button full" type="submit" disabled={contactStatus === "sending"}>{contactStatus === "sending" ? text("Изпращане…", "Sending…") : contactKind === "order" ? text("Изпрати заявка за поръчка", "Send order request") : text("Изпрати", "Send")}</button>
          </form>}
        </section>
      </div>}
    </main>
  );
}
