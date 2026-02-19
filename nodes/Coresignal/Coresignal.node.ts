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
		subtitle: '={{$parameter["action"] + " - " + $parameter["category"] + " (" + $parameter["dataset"] + ")"}}',
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
			// Category Selection
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'employee data',
						value: 'employee',
						description: 'Access employee data and profiles',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'company data',
						value: 'company',
						description: 'Access company data and profiles',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'job data',
						value: 'job',
						description: 'Access jobs data',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'employee posts',
						value: 'post',
						description: 'Access employee posts data',
					},
				],
				default: 'employee',
			},

			// ============ METHOD SELECTIONS ============

			// Method - Company
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['company'],
					},
				},
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'collect by ID',
						value: 'collect_by_id',
						description: 'Retrieve a full company profile using a company ID',
						action: 'Retrieve a full company profile using a company ID',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'collect by slug',
						value: 'collect_by_slug',
						description: 'Retrieve a full company profile using a URL slug',
						action: 'Retrieve a full company profile using a URL slug',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'enrich by website',
						value: 'enrich',
						description: 'Enrich company data using a website URL',
						action: 'Enrich company data using a website URL',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search companies using an Elasticsearch DSL query',
						action: 'Search companies using an elasticsearch dsl query',
					},
				],
				default: 'collect_by_id',
			},

			// Method - Employee
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['employee'],
					},
				},
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'collect by ID',
						value: 'collect_by_id',
						description: 'Retrieve a full employee profile using an employee ID',
						action: 'Retrieve a full employee profile using an employee ID',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'collect by slug',
						value: 'collect_by_slug',
						description: 'Retrieve a full employee profile using a URL slug',
						action: 'Retrieve a full employee profile using a URL slug',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search employees using an Elasticsearch DSL query',
						action: 'Search employees using an elasticsearch dsl query',
					},
				],
				default: 'collect_by_id',
			},

			// Method - Jobs
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['job'],
					},
				},
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'collect by ID',
						value: 'collect_by_id',
						description: 'Retrieve a full job posting using a job ID',
						action: 'Retrieve a full job posting using a job ID',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search jobs using an Elasticsearch DSL query',
						action: 'Search jobs using an elasticsearch dsl query',
					},
				],
				default: 'collect_by_id',
			},

			// Method - Posts
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						category: ['post'],
					},
				},
				options: [
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'collect by ID',
						value: 'collect_by_id',
						description: 'Retrieve a full employee post using a post ID',
						action: 'Retrieve a full employee post using a post ID',
					},
					{
						// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
						name: 'search with Elasticsearch DSL',
						value: 'search_es_dsl',
						description: 'Search employee posts using an Elasticsearch DSL query',
						action: 'Search employee posts using an elasticsearch dsl query',
					},
				],
				default: 'collect_by_id',
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
						category: ['company'],
						action: ['collect_by_id'],
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
						category: ['employee'],
						action: ['collect_by_id'],
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
						category: ['job'],
						action: ['collect_by_id'],
					},
				},
				default: '',
				description: 'The ID of the job posting to retrieve',
			},

			// ID Parameter - Post
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Employee post ID',
				name: 'postId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						category: ['post'],
						action: ['collect_by_id'],
					},
				},
				default: '',
				description: 'The ID of the post to retrieve',
			},

			// Shorthand Name Parameter - Employee
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'URL slug',
				name: 'slug',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						category: ['employee'],
						action: ['collect_by_slug'],
					},
				},
				default: '',
				placeholder: 'e.g., john-smith',
				description: 'The slug to retrieve data for',
			},

			// Shorthand Name Parameter - Company
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'URL slug',
				name: 'slug',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						category: ['company'],
						action: ['collect_by_slug'],
					},
				},
				default: '',
				placeholder: 'e.g., microsoft',
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
						category: ['company'],
						action: ['enrich'],
					},
				},
				default: '',
				placeholder: 'e.g., https://example.com',
				description: 'The company website URL to enrich data for',
			},

			// Fields Parameter - Employee
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Data fields (optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						category: ['employee'],
						action: ['collect_by_id', 'collect_by_slug'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g., id,full_name,headline',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Fields Parameter - Company
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Data fields (optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						category: ['company'],
						action: ['collect_by_id', 'collect_by_slug', 'enrich'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g., id,company_name,website',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Fields Parameter - Jobs
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Data fields (optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						category: ['job'],
						action: ['collect_by_id'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g., id,title,company_name',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Fields Parameter - Posts
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Data fields (optional)',
				name: 'fields',
				type: 'string',
				displayOptions: {
					show: {
						category: ['post'],
						action: ['collect_by_id'],
					},
				},
				default: '',
				// eslint-disable-next-line n8n-nodes-base/node-param-placeholder-miscased-id
				placeholder: 'e.g., id,url,author_name',
				description: 'Comma-separated list of fields to return (leave empty for all fields)',
			},

			// Elasticsearch DSL Query - Employee
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Elasticsearch DSL query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						category: ['employee'],
						action: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
				hint: 'Build your query using a <a href="https://dashboard.coresignal.com/apis/employees/playground" target="_blank">Playground</a>.',
			},

			// Elasticsearch DSL Query - Company
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Elasticsearch DSL query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						category: ['company'],
						action: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
				hint: 'Build your query using a <a href="https://dashboard.coresignal.com/apis/company/playground" target="_blank">Playground</a>.',
			},

			// Elasticsearch DSL Query - Job
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Elasticsearch DSL query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						category: ['job'],
						action: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
				hint: 'Build your query using a <a href="https://dashboard.coresignal.com/apis/jobs/playground" target="_blank">Playground</a>.',
			},

			// Elasticsearch DSL Query - Post
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Elasticsearch DSL query',
				name: 'esQuery',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						category: ['post'],
						action: ['search_es_dsl'],
					},
				},
				default: '{"query": {"match_all": {}}}',
				description: 'Elasticsearch DSL query object',
			},

			// Preview Mode (not available for posts)
			{
				// eslint-disable-next-line n8n-nodes-base/node-param-display-name-miscased
				displayName: 'Preview mode',
				name: 'preview',
				type: 'boolean',
				default: false,
				displayOptions: {
					show: {
						category: ['employee', 'company', 'job'],
						action: ['search_es_dsl'],
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
				const category = this.getNodeParameter('category', i) as string;
				const dataset = 'multi_source'; // Always use multi_source
				const action = this.getNodeParameter('action', i) as string;

				let url = '';
				let httpMethod: 'GET' | 'POST' = 'GET';
				let body: IDataObject | undefined;
				const qs: IDataObject = {};

				// Build the data source string (e.g., "company_multi_source", "employee_multi_source")
				// Posts use a different endpoint structure
				const dataSource = category === 'post' ? 'employee_post' : `${category}_${dataset}`;
				const baseEndpoint = `/cdapi/v2/${dataSource}`;

				switch (action) {
					case 'collect_by_id': {
						let id: string;
						if (category === 'company') {
							id = this.getNodeParameter('companyId', i) as string;
						} else if (category === 'employee') {
							id = this.getNodeParameter('employeeId', i) as string;
						} else if (category === 'job') {
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

					case 'collect_by_slug': {
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
					returnData.push({ json: { error: errorMessage } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as unknown as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
