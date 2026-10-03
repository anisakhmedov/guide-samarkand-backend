export enum ResidenceStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ReviewStatus {
  NOT_SENT = 'not_sent',
  PENDING = 'pending',
  APPROVED = 'approved',
}

export enum AccessStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export enum PlaceCategory {
  RESTAURANT = 'restaurant',
  CAFE = 'cafe',
  ATTRACTION = 'attraction',
  SERVICE = 'service',
}

export enum RouteTheme {
  HISTORY = 'history',
  FOOD = 'food',
  KIDS = 'kids',
  EVENING = 'evening',
  PHOTO = 'photo',
}

export enum RouteDuration {
  SHORT = 'short', // 1-2 hours
  HALF_DAY = 'half_day',
  FULL_DAY = 'full_day',
}

export enum TransportType {
  WALKING = 'walking',
  TRANSPORT = 'transport',
}

export enum RouteCreatedBy {
  ADMIN = 'admin',
  GUEST = 'guest',
}

export enum ChatSender {
  GUEST = 'guest',
  ADMIN = 'admin',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  RECEPTION = 'reception',
  CONTENT_MANAGER = 'content_manager',
}

export enum DiscountStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
}

export enum MenuItemType {
  FOOD = 'food',
  DRINK = 'drink',
}

export enum ServiceRequestType {
  FOOD_ORDER = 'food_order',
  DRINK_ORDER = 'drink_order',
  WAKE_UP = 'wake_up',
  CLEANING = 'cleaning',
  PROBLEM = 'problem',
  EXTENSION = 'extension',
  HOOKAH = 'hookah',
}

export enum ServiceRequestStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  DONE = 'done',
  REJECTED = 'rejected',
}

// Messengers/socials a guest can be contacted through (registration form).
export enum ContactChannel {
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  WECHAT = 'wechat',
  VIBER = 'viber',
  OTHER = 'other',
}

// Channels reachable by the phone number itself — username is optional for them.
export const PHONE_BASED_CHANNELS: ContactChannel[] = [ContactChannel.WHATSAPP, ContactChannel.VIBER];
