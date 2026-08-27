import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

import { Guest, GuestSchema } from '../modules/guests/schemas/guest.schema';
import { Place, PlaceSchema } from '../modules/places/schemas/place.schema';
import { Route, RouteSchema } from '../modules/routes/schemas/route.schema';
import { AdminUser, AdminUserSchema } from '../modules/admin-users/schemas/admin-user.schema';
import {
  AccessStatus,
  AdminRole,
  PlaceCategory,
  ResidenceStatus,
  ReviewStatus,
  RouteCreatedBy,
  RouteDuration,
  RouteTheme,
  TransportType,
} from '../common/enums';

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_guide';
  await mongoose.connect(uri);
  console.log(`Connected to ${uri}`);

  const GuestModel = mongoose.model(Guest.name, GuestSchema);
  const PlaceModel = mongoose.model(Place.name, PlaceSchema);
  const RouteModel = mongoose.model(Route.name, RouteSchema);
  const AdminUserModel = mongoose.model(AdminUser.name, AdminUserSchema);

  // ---- Staff accounts ----
  const superLogin = process.env.SEED_SUPERADMIN_LOGIN || 'admin';
  const superPassword = process.env.SEED_SUPERADMIN_PASSWORD || 'admin123';
  const superName = process.env.SEED_SUPERADMIN_NAME || 'Super Admin';

  let superAdmin = await AdminUserModel.findOne({ login: superLogin });
  if (!superAdmin) {
    superAdmin = await AdminUserModel.create({
      name: superName,
      login: superLogin,
      passwordHash: await bcrypt.hash(superPassword, 10),
      role: AdminRole.SUPER_ADMIN,
    });
    console.log(`Created super-admin "${superLogin}" / "${superPassword}" (change this password!)`);
  }

  if (!(await AdminUserModel.findOne({ login: 'reception' }))) {
    await AdminUserModel.create({
      name: 'Reception Desk',
      login: 'reception',
      passwordHash: await bcrypt.hash('reception123', 10),
      role: AdminRole.RECEPTION,
    });
    console.log('Created reception staff account: reception / reception123');
  }

  if (!(await AdminUserModel.findOne({ login: 'content' }))) {
    await AdminUserModel.create({
      name: 'Content Manager',
      login: 'content',
      passwordHash: await bcrypt.hash('content123', 10),
      role: AdminRole.CONTENT_MANAGER,
    });
    console.log('Created content-manager account: content / content123');
  }

  // ---- Places (Samarkand) ----
  const placesData = [
    {
      category: PlaceCategory.ATTRACTION,
      name: 'Регистан',
      description:
        'Регистан — «песчаное место» — был сердцем средневекового Самарканда: здесь глашатаи читали указы правителей, а базарная площадь превращалась в парадный въезд города. Ансамбль сложился не сразу. Первым, в 1417–1420 годах, выросло медресе Улугбека — правителя-астронома, внука Тамерлана, который сам преподавал здесь математику и астрономию. Спустя два столетия напротив него зодчие возвели медресе Шердор («Обладающее львами») с редким для исламской архитектуры изображением тигров, несущих на спине солнце с человеческим лицом — прямое нарушение канона, обошедшееся мастерам смелой находкой. Завершает площадь золочёное изнутри медресе Тилля-Кари, чей купольный зал целиком покрыт сусальным золотом.',
      photos: [],
      location: { lat: 39.6542, lng: 66.9758 },
      district: 'Центр',
      workingHours: '08:00–19:00',
      extraFields: { ticketPrice: '50 000 UZS', visitDuration: '1.5 часа' },
      recommendedByHotel: true,
    },
    {
      category: PlaceCategory.ATTRACTION,
      name: 'Гур-Эмир',
      description:
        'Гур-Эмир — «могила эмира» — усыпальница Амира Тимура (Тамерлана), построенная в начале XV века. Задумывался мавзолей для внука полководца, Мухаммад-Султана, но судьба распорядилась иначе: под его ребристым бирюзовым куполом упокоился и сам грозный завоеватель, а рядом с ним — его учёный внук Улугбек. С надгробием Тимура связана известная легенда: на нём высечено предупреждение, что вскрывший гробницу навлечёт войну страшнее его собственных походов. Когда в июне 1941 года советские антропологи всё же вскрыли захоронение, чтобы восстановить облик полководца, всего через несколько дней началась война с нацистской Германией — совпадение, о котором до сих пор помнят местные жители.',
      photos: [],
      location: { lat: 39.6501, lng: 66.9714 },
      district: 'Центр',
      workingHours: '08:00–19:00',
      extraFields: { ticketPrice: '35 000 UZS', visitDuration: '45 минут' },
      recommendedByHotel: true,
    },
    {
      category: PlaceCategory.ATTRACTION,
      name: 'Биби-Ханым',
      description:
        'Соборную мечеть Биби-Ханым Тимур повелел построить после похода в Индию, задумав её как одну из крупнейших мечетей исламского мира — с порталом высотой более 30 метров и мраморным Кораном-пюпитром во дворе. Названа мечеть в честь его старшей жены. Легенда рассказывает, что зодчий, руководивший строительством, влюбился в Биби-Ханым и согласился завершить работу вовремя лишь при условии поцелуя — след от этого поцелуя будто бы остался у неё на щеке навсегда, а разгневанный по возвращении из похода Тимур повелел казнить дерзкого мастера. Правда это или красивый вымысел, доподлинно неизвестно — но здание, пережившее землетрясения и века, и сегодня поражает масштабом.',
      photos: [],
      location: { lat: 39.6577, lng: 66.9767 },
      district: 'Центр',
      workingHours: '08:00–19:00',
      extraFields: { ticketPrice: '25 000 UZS', visitDuration: '40 минут' },
      recommendedByHotel: false,
    },
    {
      category: PlaceCategory.ATTRACTION,
      name: 'Шахи-Зинда',
      description:
        '«Шахи-Зинда» переводится как «живой царь» — по легенде, здесь похоронен Кусам ибн Аббас, двоюродный брат пророка Мухаммада, принёсший ислам в Согдиану в VII веке. Предание гласит, что во время молитвы на него напали, но вместо смерти он спустился в глубокий колодец и живёт там до сих пор, ожидая конца времён — отсюда и название комплекса. Вокруг его почитаемой гробницы на протяжении веков, с XI по XV, знать и духовенство возводили один мавзолей за другим, поднимаясь по лестнице в гору. Сегодня это самая нарядная улица города: стены сплошь покрыты голубой, бирюзовой и кобальтовой майоликой с растительным и геометрическим орнаментом — визитная карточка самаркандских мастеров.',
      photos: [],
      location: { lat: 39.6614, lng: 66.9797 },
      district: 'Центр',
      workingHours: '08:00–19:00',
      extraFields: { ticketPrice: '30 000 UZS', visitDuration: '1 час' },
      recommendedByHotel: true,
    },
    {
      category: PlaceCategory.ATTRACTION,
      name: 'Базар Сиаб',
      description:
        'Базар у стен Биби-Ханым торгует на этом месте веками — купцы Великого шёлкового пути останавливались здесь между переходами через пустыню, обменивая шёлк и пряности на местные товары. Сегодня Сиаб — это горы специй, сухофруктов, орехов и знаменитых круглых самаркандских лепёшек нон, рецепт которых, по легенде, невозможно повторить нигде за пределами города — говорят, дело в местной воде и особых тандырах.',
      photos: [],
      location: { lat: 39.6588, lng: 66.9784 },
      district: 'Центр',
      workingHours: '07:00–20:00',
      extraFields: { ticketPrice: 'бесплатно', visitDuration: '1 час' },
      recommendedByHotel: false,
    },
    {
      category: PlaceCategory.RESTAURANT,
      name: 'Ресторан «Платан»',
      description: 'Узбекская и европейская кухня во дворе с столетним платаном.',
      photos: [],
      location: { lat: 39.6529, lng: 66.9635 },
      district: 'Центр',
      workingHours: '10:00–23:00',
      extraFields: { cuisine: 'узбекская, европейская', priceRange: '$$' },
      recommendedByHotel: true,
    },
    {
      category: PlaceCategory.RESTAURANT,
      name: 'Karimbek',
      description: 'Плов-центр с несколькими видами плова, готовят с утра.',
      photos: [],
      location: { lat: 39.6473, lng: 66.9601 },
      district: 'Новый город',
      workingHours: '08:00–16:00',
      extraFields: { cuisine: 'узбекская', priceRange: '$' },
      recommendedByHotel: false,
    },
    {
      category: PlaceCategory.CAFE,
      name: 'Чайхана Bibi Khanum',
      description: 'Традиционная чайхана рядом с мечетью Биби-Ханым.',
      photos: [],
      location: { lat: 39.6570, lng: 66.9759 },
      district: 'Центр',
      workingHours: '09:00–22:00',
      extraFields: { cuisine: 'чай, выпечка', priceRange: '$' },
      recommendedByHotel: true,
    },
    {
      category: PlaceCategory.SERVICE,
      name: 'Обмен валют «Ipoteka Bank»',
      description: 'Обмен валют рядом с Регистаном.',
      photos: [],
      location: { lat: 39.6535, lng: 66.9762 },
      district: 'Центр',
      workingHours: '09:00–18:00',
      extraFields: { serviceType: 'обмен валют' },
      recommendedByHotel: false,
    },
    {
      category: PlaceCategory.SERVICE,
      name: 'Такси Samarkand City',
      description: 'Служба такси, работает по городу и в аэропорт.',
      photos: [],
      location: { lat: 39.6520, lng: 66.9680 },
      district: 'Центр',
      workingHours: 'круглосуточно',
      extraFields: { serviceType: 'такси' },
      recommendedByHotel: true,
    },
    {
      category: PlaceCategory.SERVICE,
      name: 'Аптека 36.6',
      description: 'Круглосуточная аптека в центре города.',
      photos: [],
      location: { lat: 39.6512, lng: 66.9670 },
      district: 'Центр',
      workingHours: 'круглосуточно',
      extraFields: { serviceType: 'аптека' },
      recommendedByHotel: false,
    },
  ];

  const placeDocs: Record<string, any> = {};
  for (const p of placesData) {
    let doc = await PlaceModel.findOne({ name: p.name });
    if (!doc) {
      doc = await PlaceModel.create(p);
      console.log(`Created place: ${p.name}`);
    }
    placeDocs[p.name] = doc;
  }

  // ---- Admin route: history walk ----
  if (!(await RouteModel.findOne({ title: 'Классический маршрут по центру' }))) {
    const stops = ['Регистан', 'Гур-Эмир', 'Биби-Ханым', 'Шахи-Зинда'];
    const points = stops.map((name, i) => ({
      placeId: placeDocs[name]._id,
      order: i,
      comment: i === 1 ? 'Рядом чайхана — можно отдохнуть' : '',
      legDistanceMeters: i === 0 ? 0 : 400,
      legDurationMinutes: i === 0 ? 0 : 6,
    }));
    await RouteModel.create({
      title: 'Классический маршрут по центру',
      theme: RouteTheme.HISTORY,
      durationEstimate: RouteDuration.HALF_DAY,
      transportType: TransportType.WALKING,
      createdBy: RouteCreatedBy.ADMIN,
      points,
      totalDistanceMeters: 1200,
      totalDurationMinutes: 180,
      published: true,
    });
    console.log('Created route: Классический маршрут по центру');
  }

  // ---- Demo guests ----
  if (!(await GuestModel.findOne({ name: 'Demo Guest', roomNumber: '101' }))) {
    await GuestModel.create({
      name: 'Demo Guest',
      roomNumber: '101',
      statusResidence: ResidenceStatus.APPROVED,
      statusReview: ReviewStatus.APPROVED,
      accessStatus: AccessStatus.OPEN,
      deviceSessionToken: uuid(),
      history: [{ action: 'seeded:fully_approved', at: new Date() }],
    });
    console.log('Created demo guest with full access: name="Demo Guest", room="101"');
  }

  if (!(await GuestModel.findOne({ name: 'Pending Guest', roomNumber: '202' }))) {
    await GuestModel.create({
      name: 'Pending Guest',
      roomNumber: '202',
      deviceSessionToken: uuid(),
      history: [{ action: 'seeded:pending', at: new Date() }],
    });
    console.log('Created demo guest awaiting approval: name="Pending Guest", room="202"');
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
