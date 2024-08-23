import { IAccountMapper } from "@ticketing/account/types";
import { ServicenowAccountInput, ServicenowAccountOutput } from "./types";
import { UnifiedTicketingAccountInput, UnifiedTicketingAccountOutput } from "@ticketing/account/types/model.unified";
import { MappersRegistry } from '@@core/@core-services/registries/mappers.registry';
import { Injectable } from '@nestjs/common';
import { Utils } from '@ticketing/@lib/@utils';

@Injectable()
export class ServicenowAccountMapper implements IAccountMapper {
	constructor(private mappersRegistry: MappersRegistry, private utils: Utils) {
		this.mappersRegistry.registerService('ticketing', 'account', 'servicenow', this);
	}
	desunify(source: UnifiedTicketingAccountInput, customFieldMappings?: { slug: string; remote_id: string; }[]): ServicenowAccountInput {
		return;
	}

	unify(
		source: ServicenowAccountOutput | ServicenowAccountOutput[],
		connectionId: string,
		customFieldMappings?: {
			slug: string;
			remote_id: string;
		}[]
	): UnifiedTicketingAccountOutput | UnifiedTicketingAccountOutput[] {
		// If the source is not an array, convert it to an array for mapping
		const sourcesArray = Array.isArray(source) ? source : [source];

		return sourcesArray.map((account) =>
			this.mapSingleAccountToUnified(
				account,
				connectionId,
				customFieldMappings,
			),
		);

	}

	private mapSingleAccountToUnified(
		account: ServicenowAccountOutput,
		connectionId: string,
		customFieldMappings?: {
			slug: string;
			remote_id: string;
		}[],
	): UnifiedTicketingAccountOutput {
		const field_mappings: { [key: string]: any } = {};

		const unifiedAccount: UnifiedTicketingAccountOutput = {
			name: account.name,
			domains: Array.isArray(account.website) ? account.website : [account.website],
			remote_id: account.sys_id,
			created_at: new Date(account.sys_created_on),
			modified_at: new Date(account.sys_updated_on)
		};

		return unifiedAccount;
	}
}
