// src/schemas/property.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PropertyDocument = Property & Document;

export enum PropertyStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  MAINTENANCE = 'maintenance'
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  CONDO = 'condo',
  STUDIO = 'studio',
  VILLA = 'villa'
}

// Define nested schemas for complex objects
@Schema({ _id: false })
export class Coordinates {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;
}

@Schema({ _id: false })
export class Location {
  @Prop({ required: true })
  address: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string;

  @Prop({ required: true })
  country: string;

  @Prop({ type: Coordinates, required: false })
  coordinates?: Coordinates;
}

@Schema({ _id: false })
export class PropertyDetails {
  @Prop({ required: true })
  bedrooms: number;

  @Prop({ required: true })
  bathrooms: number;

  @Prop({ required: true })
  area_sqft: number;

  @Prop({ required: true })
  furnished: boolean;

  @Prop({ type: [String], default: [] })
  amenities: string[];
}

@Schema({ _id: false })
export class ContactInfo {
  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  email: string;

  @Prop({ 
    required: true,
    enum: ['phone', 'email'],
    default: 'email'
  })
  preferred_contact_method: 'phone' | 'email';
}

@Schema({ 
  timestamps: true,
  collection: 'properties'
})
export class Property {
  @Prop({ required: true, unique: true })
  blockchain_id: number; 

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  owner_address: string; // StarkNet wallet address

  @Prop({ default: null })
  tenant_address: string; // StarkNet wallet address

  @Prop({ required: true })
  rent_per_month: number; // In USDT (smallest unit)

  @Prop({ 
    type: String, 
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE 
  })
  status: PropertyStatus;

  @Prop({ 
    type: String, 
    enum: PropertyType,
    required: true 
  })
  property_type: PropertyType;

  @Prop({ type: Location, required: true })
  location: Location;

  @Prop({ type: [String], default: [] })
  images: string[]; // URLs to property images

  @Prop({ type: PropertyDetails, required: true })
  details: PropertyDetails;

  @Prop({ default: null })
  transaction_hash: string; // StarkNet transaction hash

  @Prop({ default: Date.now })
  listed_at: Date;

  @Prop({ default: null })
  booked_at: Date;

  @Prop({ default: null })
  lease_duration_months: number;

  @Prop({ default: null })
  lease_end_date: Date;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ type: ContactInfo, required: false })
  contact_info?: ContactInfo;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const PropertySchema = SchemaFactory.createForClass(Property);


export const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);
export const LocationSchema = SchemaFactory.createForClass(Location);
export const PropertyDetailsSchema = SchemaFactory.createForClass(PropertyDetails);
export const ContactInfoSchema = SchemaFactory.createForClass(ContactInfo);