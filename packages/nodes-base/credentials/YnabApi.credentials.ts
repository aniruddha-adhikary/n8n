import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';

export class YnabApi implements ICredentialType {
	name = 'ynabApi';
	displayName = 'YNAB API';
	documentationUrl = 'ynab';
	properties = [
		{
			displayName: 'Personal Access Token',
			name: 'personalAccessToken',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
	];
}
