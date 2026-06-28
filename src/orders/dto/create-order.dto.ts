import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsPositive, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @ApiProperty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsString()
  productTitle: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  productPrice: number;

  @ApiProperty()
  @IsString()
  productImage: string;

  @ApiProperty()
  @IsString()
  size: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  total: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  totalItems: number;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  shippingAddress: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  shippingCity: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  shippingState: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  shippingZip: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  shippingCountry: string;
}
