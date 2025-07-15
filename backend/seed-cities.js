const { City } = require('./models');

const prefectures = [
  { name: '北海道', region: '北海道' },
  { name: '青森', region: '東北' },
  { name: '岩手', region: '東北' },
  { name: '宮城', region: '東北' },
  { name: '秋田', region: '東北' },
  { name: '山形', region: '東北' },
  { name: '福島', region: '東北' },
  { name: '茨城', region: '関東' },
  { name: '栃木', region: '関東' },
  { name: '群馬', region: '関東' },
  { name: '埼玉', region: '関東' },
  { name: '千葉', region: '関東' },
  { name: '東京', region: '関東' },
  { name: '神奈川', region: '関東' },
  { name: '新潟', region: '北陸' },
  { name: '富山', region: '北陸' },
  { name: '石川', region: '北陸' },
  { name: '福井', region: '北陸' },
  { name: '山梨', region: '関東' },
  { name: '長野', region: '北陸' },
  { name: '岐阜', region: '東海' },
  { name: '静岡', region: '東海' },
  { name: '愛知', region: '東海' },
  { name: '三重', region: '東海' },
  { name: '滋賀', region: '近畿' },
  { name: '京都', region: '近畿' },
  { name: '大阪', region: '近畿' },
  { name: '兵庫', region: '近畿' },
  { name: '奈良', region: '近畿' },
  { name: '和歌山', region: '近畿' },
  { name: '鳥取', region: '中国' },
  { name: '島根', region: '中国' },
  { name: '岡山', region: '中国' },
  { name: '広島', region: '中国' },
  { name: '山口', region: '中国' },
  { name: '徳島', region: '四国' },
  { name: '香川', region: '四国' },
  { name: '愛媛', region: '四国' },
  { name: '高知', region: '四国' },
  { name: '福岡', region: '九州' },
  { name: '佐賀', region: '九州' },
  { name: '長崎', region: '九州' },
  { name: '熊本', region: '九州' },
  { name: '大分', region: '九州' },
  { name: '宮崎', region: '九州' },
  { name: '鹿児島', region: '九州' },
  { name: '沖縄', region: '九州' },
  { name: 'その他', region: 'その他' }
];

async function seedCities() {
  for (const pref of prefectures) {
    await City.findOrCreate({ where: pref });
  }
  console.log('Cities seeded!');
  process.exit();
}

seedCities(); 