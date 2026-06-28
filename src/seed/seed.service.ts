import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';
import { User } from '../auth/entities/user.entity';


@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository( User )
    private readonly userRepository: Repository<User>
  ) {}

  async onApplicationBootstrap() {
    await this.seedOnStartup();
  }

  async runSeed() {

    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.insertNewProducts( adminUser );

    return 'SEED EXECUTED';
  }

  private async seedOnStartup() {
    const [productsCount, usersCount] = await Promise.all([
      this.productsService.countProducts(),
      this.userRepository.count(),
    ]);

    if (productsCount > 0) {
      this.logger.log(`Catalog already seeded (${productsCount} products)`);
      return;
    }

    if (usersCount > 0) {
      const user = await this.userRepository.findOne({
        order: { id: 'ASC' },
      });

      if (!user) {
        await this.runSeed();
        return;
      }

      this.logger.warn('Empty catalog detected, seeding products only');
      await this.insertNewProducts(user);
      return;
    }

    this.logger.warn('Empty database detected, running full seed');
    await this.runSeed();
  }

  private async deleteTables() {

    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }

  private async insertUsers() {

    const seedUsers = initialData.users;

    const dbUsers = await this.userRepository.save( seedUsers )

    return dbUsers[0];
  }


  private async insertNewProducts( user: User ) {
    await this.productsService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push( this.productsService.create( product, user ) );
    });

    await Promise.all( insertPromises );


    return true;
  }


}
