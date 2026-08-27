import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HotelSettings, HotelSettingsDocument } from './schemas/hotel-settings.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(HotelSettings.name) private model: Model<HotelSettingsDocument>) {}

  /** Returns the singleton settings doc, creating it with defaults on first use. */
  async get(): Promise<HotelSettingsDocument> {
    let settings = await this.model.findOne();
    if (!settings) {
      settings = await this.model.create({});
    }
    return settings;
  }

  async update(patch: Partial<HotelSettings>): Promise<HotelSettingsDocument> {
    const settings = await this.get();
    Object.assign(settings, patch);
    await settings.save();
    return settings;
  }

  async discountPercent(): Promise<number> {
    const settings = await this.get();
    return settings.discountPercent;
  }
}
