import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	IHttpRequestOptions,
	NodeApiError,
	JsonObject,
} from 'n8n-workflow';

export class Coresignal implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Coresignal',
		name: 'coresignal',
		icon: 'file:logo.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + " - " + $parameter["resource"]}}',
		description: 'Interact with Coresignal API for company, employee, job, and post data',
		documentationUrl: 'https://docs.coresignal.com/?utm_source=n8n&utm_medium=referral',
		defaults: {
			name: 'Coresignal',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'coresignalApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Employee',
						value: 'employee',
						description: 'Access employee data and profiles',
					},
					{
						name: 'Company',
						value: 'company',
						description: 'Access company data and profiles',
					},
					{
						name: 'Job',
						value: 'job',
						description: 'Access jobs data',
					},
					{
						name: 'Employee Post',
						value: 'post',
						description: 'Access employee posts data',
					},
				],
				default: 'employee',
			},

			// ============ OPERATION SELECTIONS ============

			// Operation - Company
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['company'],
					},
				},
				options: [
					{
						name: 'Get by ID',
						value: 'get_by_id',
						description: 'Retrieve a full company profile using a company ID',
						action: 'Get company by ID',
					},
					{
						name: 'Get by Slug',
						value: 'get_by_slug',
						description: 'Retrieve a full company profile using a URL slug',
						action: 'Get company by URL slug',
					},
					{
						name: 'Enrich by Website',
						value: 'enrich',
						description: 'Enrich company data using a website URL',
						action: 'Enrich company by website URL',
					},
					{
						name: 'Search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search companies using an Elasticsearch DSL query',
						action: 'Search companies using elasticsearch DSL',
					},
				],
				default: 'get_by_id',
			},

			// Operation - Employee
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['employee'],
					},
				},
				options: [
					{
						name: 'Get by ID',
						value: 'get_by_id',
						description: 'Retrieve a full employee profile using an employee ID',
						action: 'Get employee by ID',
					},
					{
						name: 'Get by Slug',
						value: 'get_by_slug',
						description: 'Retrieve a full employee profile using a URL slug',
						action: 'Get employee by URL slug',
					},
					{
						name: 'Search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search employees using an Elasticsearch DSL query',
						action: 'Search employees using elasticsearch DSL',
					},
				],
				default: 'get_by_id',
			},

			// Operation - Jobs
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['job'],
					},
				},
				options: [
					{
						name: 'Get by ID',
						value: 'get_by_id',
						description: 'Retrieve a full job posting using a job ID',
						action: 'Get job by ID',
					},
					{
						name: 'Search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search jobs using an Elasticsearch DSL query',
						action: 'Search jobs using elasticsearch DSL',
					},
				],
				default: 'get_by_id',
			},

			// Operation - Posts
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['post'],
					},
				},
				options: [
					{
						name: 'Get by ID',
						value: 'get_by_id',
						description: 'Retrieve a full employee post using a post ID',
						action: 'Get employee post by ID',
					},
					{
						name: 'Search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search employee posts using an Elasticsearch DSL query',
						action: 'Search employee posts using elasticsearch DSL',
					},
				],
				default: 'get_by_id',
			},

			// ============ INPUT DATA ============

			// ID Parameter - Company
			{
				displayName: 'Company ID',
				name: 'companyId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['get_by_id'],
					},
				},
				default: '',
				description: 'The ID of the company to retrieve',
			},

			// ID Parameter - Employee
			{
				displayName: 'Employee ID',
				name: 'employeeId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['get_by_id'],
					},
				},
				default: '',
				description: 'The ID of the employee to retrieve',
			},

			// ID Parameter - Job
			{
				displayName: 'Job ID',
				name: 'jobId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['get_by_id'],
					},
				},
				default: '',
				description: 'The ID of the job posting to retrieve',
			},

			// ID Parameter - Post
			{
				displayName: 'Employee Post ID',
				name: 'postId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['get_by_id'],
					},
				},
				default: '',
				description: 'The ID of the post to retrieve',
			},

			// Shorthand Name Parameter - Employee
			{
				displayName: 'URL Slug',
				name: 'slug',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['get_by_slug'],
					},
				},
				default: '',
				placeholder: 'e.g. john-smith',
				description: 'The slug to retrieve data for',
			},

			// Shorthand Name Parameter - Company
			{
				displayName: 'URL Slug',
				name: 'slug',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['get_by_slug'],
					},
				},
				default: '',
				placeholder: 'e.g. microsoft',
				description: 'The slug to retrieve data for',
			},

			// Website Parameter - Enrich
			{
				displayName: 'Website URL',
				name: 'websiteUrl',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['enrich'],
					},
				},
				default: '',
				placeholder: 'e.g. https://example.com',
				description: 'The company website URL to enrich data for',
			},

			// Fields Parameter - Employee
			{
				displayName: 'Data Fields (Optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['get_by_id', 'get_by_slug'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g. id,full_name,headline',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Fields Parameter - Company
			{
				displayName: 'Data Fields (Optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['get_by_id', 'get_by_slug', 'enrich'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g. id,company_name,website',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Fields Parameter - Jobs
			{
				displayName: 'Data Fields (Optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['get_by_id'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g. id,title,company_name',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Fields Parameter - Posts
			{
				displayName: 'Data Fields (Optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['get_by_id'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g. id,url,author_name',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Elasticsearch DSL Query - Employee
			{
				displayName: 'Elasticsearch DSL Query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
				hint: 'Build your query using a <a href="https://dashboard.coresignal.com/apis/employees/playground" target="_blank">Playground</a>.',
			},

			// Elasticsearch DSL Query - Company
			{
				displayName: 'Elasticsearch DSL Query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['company'],
						operation: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
				hint: 'Build your query using a <a href="https://dashboard.coresignal.com/apis/company/playground" target="_blank">Playground</a>.',
			},

			// Elasticsearch DSL Query - Job
			{
				displayName: 'Elasticsearch DSL Query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['job'],
						operation: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
				hint: 'Build your query using a <a href="https://dashboard.coresignal.com/apis/jobs/playground" target="_blank">Playground</a>.',
			},

			// Elasticsearch DSL Query - Post
			{
				displayName: 'Elasticsearch DSL Query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['post'],
						operation: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
			},

			// Preview Mode (not available for posts)
			{
				displayName: 'Preview Mode',
				name: 'preview',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						resource: ['employee', 'company', 'job'],
						operation: ['search_es_dsl'],
					},
				},
				description: 'Whether to use preview endpoint (returns up to 20 results with essential data)',
				hint: 'Preview mode returns up to 20 results with essential fields only. Use it for quick testing.',
			},

		],
		usableAsTool: true,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const dataset = 'multi_source'; // Always use multi_source
				const operation = this.getNodeParameter('operation', i) as string;

				let url = '';
				let httpMethod: 'GET' | 'POST' = 'GET';
				let body: IDataObject | undefined;
				const qs: IDataObject = {};

				// Build the data source string (e.g., "company_multi_source", "employee_multi_source")
				// Posts use a different endpoint structure
				const dataSource = resource === 'post' ? 'employee_post' : `${resource}_${dataset}`;
				const baseEndpoint = `/cdapi/v2/${dataSource}`;

				switch (operation) {
					case 'get_by_id': {
						let id: string;
						if (resource === 'company') {
							id = this.getNodeParameter('companyId', i) as string;
						} else if (resource === 'employee') {
							id = this.getNodeParameter('employeeId', i) as string;
						} else if (resource === 'job') {
							id = this.getNodeParameter('jobId', i) as string;
						} else {
							id = this.getNodeParameter('postId', i) as string;
						}
						url = `${baseEndpoint}/collect/${id}`;
						httpMethod = 'GET';

						const fields = this.getNodeParameter('fields', i, '') as string;
						if (fields) {
							qs.fields = fields.split(',').map(f => f.trim());
						}
						break;
					}

					case 'get_by_slug': {
						const slug = this.getNodeParameter('slug', i) as string;
						url = `${baseEndpoint}/collect/${encodeURIComponent(slug)}`;
						httpMethod = 'GET';

						const fields = this.getNodeParameter('fields', i, '') as string;
						if (fields) {
							qs.fields = fields.split(',').map(f => f.trim());
						}
						break;
					}

					case 'enrich': {
						const websiteUrl = this.getNodeParameter('websiteUrl', i) as string;
						url = `${baseEndpoint}/enrich`;
						httpMethod = 'GET';
						qs.website = websiteUrl;

						const fields = this.getNodeParameter('fields', i, '') as string;
						if (fields) {
							qs.fields = fields.split(',').map(f => f.trim());
						}
						break;
					}

					case 'search_es_dsl': {
						const preview = this.getNodeParameter('preview', i, false) as boolean;
						url = preview
							? `${baseEndpoint}/search/es_dsl/preview`
							: `${baseEndpoint}/search/es_dsl`;
						httpMethod = 'POST';
						body = this.getNodeParameter('esQuery', i) as IDataObject;
						break;
					}
				}

				// Get credentials to access baseUrl
				const credentials = await this.getCredentials('coresignalApi');
				const baseUrl = credentials.baseUrl as string;

				const requestOptions: IHttpRequestOptions = {
					method: httpMethod,
					url: `${baseUrl}${url}`,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					arrayFormat: 'repeat',
				};

				if (Object.keys(qs).length > 0) {
					requestOptions.qs = qs;
				}

				if (body) {
					requestOptions.body = body as IDataObject;
				}

				const responseData = await this.helpers.httpRequestWithAuthentication.call(
					this,
					'coresignalApi',
					requestOptions,
				);

				// Handle both single objects and arrays from API
				const responseItems = Array.isArray(responseData) ? responseData : [responseData];

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseItems as IDataObject[]),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const errorMessage = error instanceof Error ? error.message : 'Unknown error';
					returnData.push({ json: { error: errorMessage }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
