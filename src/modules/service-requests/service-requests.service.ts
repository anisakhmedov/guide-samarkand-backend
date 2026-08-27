import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ServiceRequest, ServiceRequestDocument } from './schemas/service-request.schema';
import { ServiceRequestStatus, ServiceRequestType } from '../../common/enums';

export interface ServiceRequestFilter {
  type?: ServiceRequestType;
  status?: ServiceRequestStatus;
}

@Injectable()
export class ServiceRequestsService {
  constructor(@InjectModel(ServiceRequest.name) private model: Model<ServiceRequestDocument>) {}

  create(guestId: string, type: ServiceRequestType, payload: Record<string, unknown> = {}) {
    return this.model.create({ guestId: new Types.ObjectId(guestId), type, payload });
  }

  findAllByGuest(guestId: string) {
    return this.model.find({ guestId: new Types.ObjectId(guestId) }).sort({ createdAt: -1 }).exec();
  }

  findAll(filter: ServiceRequestFilter) {
    const query: Record<string, unknown> = {};
    if (filter.type) query.type = filter.type;
    if (filter.status) query.status = filter.status;
    return this.model.find(query).sort({ createdAt: -1 }).populate('guestId').exec();
  }

  async setStatus(id: string, status: ServiceRequestStatus) {
    const request = await this.model.findById(id);
    if (!request) throw new NotFoundException('Service request not found');
    request.status = status;
    await request.save();
    return request;
  }
}
