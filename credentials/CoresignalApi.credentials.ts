import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CoresignalApi implements ICredentialType {
	name = 'coresignalApi';
	displayName = 'Coresignal API';
	icon = { light: 'file:../nodes/Coresignal/logo.svg', dark: 'file:../nodes/Coresignal/logo.svg' } as const;
	documentationUrl = 'https://docs.coresignal.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your Coresignal API key',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.coresignal.com',
			required: true,
			description: 'Base URL for Coresignal API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'apikey': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/cdapi/v2/company_base/collect/2',
		},
	};
}
