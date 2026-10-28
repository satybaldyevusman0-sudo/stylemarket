// StyleMarket: сайттын жөндөөлөрү (тема, тексттер, категориялар, тарифтер, байланыштар)
export default {
  "slug": "stylemarket",
  "name": "StyleMarket",
  "nameParts": [
    "Style",
    "Market"
  ],
  "logo": "👗",
  "currency": "KGS",
  "theme": {
    "primary": "#db2777",
    "primaryDark": "#be185d",
    "accent": "#111827",
    "dark": "#2a0a1a"
  },
  "heroImage": "https://loremflickr.com/1600/900/fashion,clothes?lock=121",
  "contacts": {
    "phone": "+996 774 054 601",
    "instagram": "satyba1dyev18",
    "address": {
      "ky": "Бишкек ш., Кыргызстан",
      "ru": "г. Бишкек, Кыргызстан",
      "en": "Bishkek, Kyrgyzstan"
    }
  },
  "text": {
    "tagline": {
      "ky": "Кийим-кече интернет-дүкөнү",
      "ru": "Интернет-магазин одежды",
      "en": "Online fashion store"
    },
    "heroTitle": {
      "ky": "Жаңы сезон — жаңы стиль",
      "ru": "Новый сезон — новый стиль",
      "en": "New season — new style"
    },
    "heroText": {
      "ky": "Аялдар, эркектер жана балдар үчүн кийимдер, бут кийим жана аксессуарлар. Бишкек боюнча өлчөп көрүү менен жеткирүү.",
      "ru": "Одежда, обувь и аксессуары для женщин, мужчин и детей. Доставка с примеркой по Бишкеку.",
      "en": "Clothes, shoes and accessories for women, men and kids. Delivery with try-on in Bishkek."
    },
    "catalog": {
      "ky": "Каталог",
      "ru": "Каталог",
      "en": "Catalog"
    },
    "catalogText": {
      "ky": "Өлчөм, баа жана категория боюнча",
      "ru": "По размеру, цене и категории",
      "en": "By size, price and category"
    },
    "search": {
      "ky": "Издөө: куртка, кроссовка…",
      "ru": "Поиск: куртка, кроссовки…",
      "en": "Search: jacket, sneakers…"
    },
    "plans": {
      "ky": "Стилист кызматы",
      "ru": "Услуги стилиста",
      "en": "Stylist"
    },
    "plansText": {
      "ky": "Жеке стиль жана гардероб",
      "ru": "Личный стиль и гардероб",
      "en": "Personal style & wardrobe"
    },
    "booking": {
      "ky": "Өлчөп көрүү",
      "ru": "Примерка",
      "en": "Try-on"
    },
    "bookingText": {
      "ky": "Шоурумда өлчөп көрүүгө жазылыңыз",
      "ru": "Запишитесь на примерку в шоуруме",
      "en": "Book a showroom try-on"
    },
    "bookBtn": {
      "ky": "Өлчөп көрүүгө жазылуу",
      "ru": "Записаться на примерку",
      "en": "Book try-on"
    },
    "buy": {
      "ky": "Корзинага",
      "ru": "В корзину",
      "en": "Add to cart"
    },
    "about": {
      "ky": "StyleMarket — заманбап кийимдер Бишкекте.",
      "ru": "StyleMarket — современная одежда в Бишкеке.",
      "en": "StyleMarket — modern fashion in Bishkek."
    }
  },
  "categories": [
    {
      "id": "women",
      "name": {
        "ky": "Аялдар",
        "ru": "Женщинам",
        "en": "Women"
      },
      "icon": "👚",
      "image": "https://loremflickr.com/800/600/woman,fashion?lock=1015"
    },
    {
      "id": "men",
      "name": {
        "ky": "Эркектер",
        "ru": "Мужчинам",
        "en": "Men"
      },
      "icon": "👔",
      "image": "https://loremflickr.com/800/600/man,fashion?lock=983"
    },
    {
      "id": "kids",
      "name": {
        "ky": "Балдар",
        "ru": "Детям",
        "en": "Kids"
      },
      "icon": "🧒",
      "image": "https://loremflickr.com/800/600/kids,clothes?lock=1044"
    },
    {
      "id": "shoes",
      "name": {
        "ky": "Бут кийим",
        "ru": "Обувь",
        "en": "Shoes"
      },
      "icon": "👟",
      "image": "https://loremflickr.com/800/600/sneakers?lock=1020"
    },
    {
      "id": "acc",
      "name": {
        "ky": "Аксессуарлар",
        "ru": "Аксессуары",
        "en": "Accessories"
      },
      "icon": "👜",
      "image": "https://loremflickr.com/800/600/handbag?lock=991"
    }
  ],
  "plans": [
    {
      "id": "stylist",
      "icon": "💇",
      "price": 2500,
      "popular": true,
      "title": {
        "ky": "Стилист менен шопинг (2 саат)",
        "ru": "Шопинг со стилистом (2 часа)",
        "en": "Shopping with a stylist (2h)"
      },
      "desc": {
        "ky": "Образ тандоо",
        "ru": "Подбор образа",
        "en": "Outfit selection"
      }
    },
    {
      "id": "wardrobe",
      "icon": "🧥",
      "price": 4900,
      "title": {
        "ky": "Гардеробду талдоо",
        "ru": "Разбор гардероба",
        "en": "Wardrobe audit"
      },
      "desc": {
        "ky": "Үйдө, капсула түзүү",
        "ru": "На дому, капсула",
        "en": "At home, capsule wardrobe"
      }
    },
    {
      "id": "gift",
      "icon": "🎁",
      "price": 3000,
      "title": {
        "ky": "Белек сертификаты 3000",
        "ru": "Подарочный сертификат 3000",
        "en": "Gift card 3000"
      },
      "desc": {
        "ky": "Каалаган товарга",
        "ru": "На любой товар",
        "en": "For any item"
      }
    }
  ],
  "booking": {
    "slots": [
      "11:00",
      "12:00",
      "13:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00"
    ],
    "formats": [
      {
        "id": "showroom",
        "label": {
          "ky": "Шоурумда",
          "ru": "В шоуруме",
          "en": "Showroom"
        }
      },
      {
        "id": "courier",
        "label": {
          "ky": "Курьер менен (үйдө)",
          "ru": "С курьером (дома)",
          "en": "With courier (home)"
        }
      }
    ],
    "itemLabel": {
      "ky": "Товар",
      "ru": "Товар",
      "en": "Item"
    },
    "sundayOff": false
  },
  "features": [
    {
      "icon": "📏",
      "title": {
        "ky": "Өлчөп көрүү",
        "ru": "Примерка",
        "en": "Try-on"
      },
      "text": {
        "ky": "Курьер күтүп турат — жакпаса кайтарыңыз.",
        "ru": "Курьер подождёт — не подошло, верните.",
        "en": "Courier waits — return if it doesn't fit."
      }
    },
    {
      "icon": "🔁",
      "title": {
        "ky": "14 күн алмаштыруу",
        "ru": "Обмен 14 дней",
        "en": "14-day exchange"
      },
      "text": {
        "ky": "Өлчөмү туура келбесе.",
        "ru": "Если не подошёл размер.",
        "en": "If the size is wrong."
      }
    },
    {
      "icon": "🧵",
      "title": {
        "ky": "Сапаттуу материалдар",
        "ru": "Качественные материалы",
        "en": "Quality fabrics"
      },
      "text": {
        "ky": "Пахта, жүн, тери.",
        "ru": "Хлопок, шерсть, кожа.",
        "en": "Cotton, wool, leather."
      }
    },
    {
      "icon": "🇰🇬",
      "title": {
        "ky": "Жергиликтүү бренддер",
        "ru": "Местные бренды",
        "en": "Local brands"
      },
      "text": {
        "ky": "Кыргыз дизайнерлери.",
        "ru": "Кыргызские дизайнеры.",
        "en": "Kyrgyz designers."
      }
    }
  ],
  "stats": [
    {
      "value": "5",
      "label": {
        "ky": "категория",
        "ru": "категорий",
        "en": "categories"
      }
    },
    {
      "value": "XS–3XL",
      "label": {
        "ky": "өлчөмдөр",
        "ru": "размеры",
        "en": "sizes"
      }
    },
    {
      "value": "14 күн",
      "label": {
        "ky": "алмаштыруу",
        "ru": "обмен",
        "en": "exchange"
      }
    },
    {
      "value": "1 күн",
      "label": {
        "ky": "жеткирүү",
        "ru": "доставка",
        "en": "delivery"
      }
    }
  ],
  "specLabels": {
    "sizes": {
      "ky": "Өлчөмдөр",
      "ru": "Размеры",
      "en": "Sizes"
    },
    "material": {
      "ky": "Материал",
      "ru": "Материал",
      "en": "Material"
    },
    "color": {
      "ky": "Түсү",
      "ru": "Цвет",
      "en": "Color"
    },
    "season": {
      "ky": "Мезгил",
      "ru": "Сезон",
      "en": "Season"
    },
    "country": {
      "ky": "Өндүрүүчү",
      "ru": "Производство",
      "en": "Made in"
    }
  },
  "faq": [
    {
      "keys": [
        "өлчөм",
        "размер",
        "size"
      ],
      "answer": {
        "ky": "Ар бир товардын бетинде өлчөмдөр жазылган; өлчөп көрүүгө жазылсаңыз болот.",
        "ru": "Размеры указаны у каждого товара; можно записаться на примерку.",
        "en": "Sizes are listed per item; book a try-on."
      },
      "link": "/booking"
    },
    {
      "keys": [
        "алмаш",
        "обмен",
        "exchange",
        "кайтар"
      ],
      "answer": {
        "ky": "14 күндүн ичинде алмаштырса болот.",
        "ru": "Обмен в течение 14 дней.",
        "en": "14-day exchange."
      },
      "link": "/contact"
    }
  ],
  "priceNote": {
    "ky": "Баалар Бишкек дүкөндөрүнө жакын, болжолдуу.",
    "ru": "Цены ориентировочные.",
    "en": "Approximate prices."
  },
  "dataNote": {
    "ky": "Баалар болжолдуу (28.10.2026).",
    "ru": "Цены ориентировочные (28.10.2026).",
    "en": "Approximate prices (28.10.2026)."
  },
  "sources": []
};
