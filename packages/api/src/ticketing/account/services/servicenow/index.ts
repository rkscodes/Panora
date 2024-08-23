import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IAccountService } from '@ticketing/account/types';
import { ServicenowAccountOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class ServicenowService implements IAccountService {
	constructor(
		private prisma: PrismaService,
		private logger: LoggerService,
		private cryptoService: EncryptionService,
		private registry: ServiceRegistry,
	) {
		this.logger.setContext(
			TicketingObject.account.toUpperCase() + ':' + ServicenowService.name,
		);
		this.registry.registerService('servicenow', this);
	}

	async sync(data: SyncParam): Promise<ApiResponse<ServicenowAccountOutput[]>> {
		try {
			const { linkedUserId } = data;

			const connection = await this.prisma.connections.findFirst({
				where: {
					id_linked_user: linkedUserId,
					provider_slug: 'servicenow',
					vertical: 'ticketing',
				},
			});

			const resp = await axios.get(`${connection.account_url}/api/now/account`, {
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.cryptoService.decrypt(
						connection.access_token,
					)}`,
				},
			});

			this.logger.log(`Synced front accounts !`);

			return {
				data: resp.data._results,
				message: 'Front accounts retrieved',
				statusCode: 200,
			};
		} catch (error) {
			throw error;
		}
	}
}
