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
