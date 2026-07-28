import type * as types from './types.js';
import type { ConfigOptions, FetchResponse } from '@readme/api-core/types';
import APICore from '@readme/api-core';
import definition from '../openapi.json' with {
  type: 'json'
};

export default class SDK {
  core: APICore;

  constructor() {
    this.core = new APICore(definition, 'acculynxapi/2.2614.0 (api/7.0.0)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Use this endpoint to get a listing of the countries supported by AccuLynx.
   * **Supported includes:** `states`.
   *
   *
   * @summary Get AccuLynx Countries
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   */
  getAccuLynxCountries(metadata?: types.GetAccuLynxCountriesMetadataParam): Promise<FetchResponse<200, types.CountryCollection>> {
    return this.core.fetch('/acculynx/countries', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific country.
   * **Supported includes:** `states`.
   *
   *
   * @summary Get an AccuLynx Country
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAccuLynxCountry(metadata: types.GetAccuLynxCountryMetadataParam): Promise<FetchResponse<200, types.Country>> {
    return this.core.fetch('/acculynx/countries/{countryId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get the states supported by AccuLynx for a country.
   * **Supported includes:** `states`.
   *
   *
   * @summary Get States
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAccuLynxStates(metadata: types.GetAccuLynxStatesMetadataParam): Promise<FetchResponse<200, types.StateCollection>> {
    return this.core.fetch('/acculynx/countries/{countryId}/states', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific state within a specific country.
   *
   *
   * @summary Get a Particular State
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAccuLynxState(metadata: types.GetAccuLynxStateMetadataParam): Promise<FetchResponse<200, types.State>> {
    return this.core.fetch('/acculynx/countries/{countryId}/states/{stateId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get the list of the catalog units of measure.
   *
   *
   * @summary Get Units of Measure
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   */
  getAccuLynxUnitsOfMeasure(): Promise<FetchResponse<200, types.UnitOfMeasureCollection>> {
    return this.core.fetch('/acculynx/units-of-measure', 'get');
  }

  /**
   * Use this endpoint to get a list of calendars for the location. This endpoint will return
   * a paginated response starting from the given record index.
   *
   *
   * @summary Get Calendars
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCalendars(metadata?: types.GetCalendarsMetadataParam): Promise<FetchResponse<200, types.CalendarCollection>> {
    return this.core.fetch('/calendars', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of appointments for the specified calendar. The request
   * range should not exceed 90 days.
   *
   *
   * @summary Get Calendar Appointments
   */
  getAppointments(metadata: types.GetAppointmentsMetadataParam): Promise<FetchResponse<200, types.CalendarSearchEventCollection>> {
    return this.core.fetch('/calendars/{calendarId}/appointments', 'get', metadata);
  }

  /**
   * Use this endpoint to get the appointment details for a specific calendar event.
   *
   *
   * @summary Get Appointment Details
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAppointmentById(metadata: types.GetAppointmentByIdMetadataParam): Promise<FetchResponse<200, types.CalendarEvent>> {
    return this.core.fetch('/calendars/{calendarId}/appointments/{appointmentId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of settings for the current location.
   *
   *
   * @summary Get Company Settings
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   */
  getCompanySettings(): Promise<FetchResponse<200, types.CompanySettings>> {
    return this.core.fetch('/company-settings', 'get');
  }

  /**
   * Use this endpoint to retrieve custom field definitions and the options related to each
   * custom field definition by company.
   * Returns Custom Field Definitions for types "contact" and "job" with only active status.
   * Includes field options with active status by default.
   * Custom Field Definitions are returned by grouped by field type.
   * StartIndex starts at 0. Default PageSize is 25. Pagination parameters are optional.
   * You can filter by type 'jobs' or 'contacts'. By default both filters are included. `e.g.
   * ?filter=jobs`.
   * **Supported includes:** `user`.
   *
   *
   * @summary Get Custom Field Definitions
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCompanySettingsCustomFields(metadata?: types.GetCompanySettingsCustomFieldsMetadataParam): Promise<FetchResponse<200, types.CustomFieldDefinitionsCollection>> {
    return this.core.fetch('/company-settings/custom-fields', 'get', metadata);
  }

  /**
   * Use this endpoint to get the document folders for a company. This endpoint will return a
   * paginated response starting from the given record index.
   *
   *
   * @summary Get Document Folders
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCompanyDocumentFolders(metadata?: types.GetCompanyDocumentFoldersMetadataParam): Promise<FetchResponse<200, types.DocumentFoldersCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/document-folders', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of the photo and video tags for the current location.
   * The response is paginated based on the pageSize and StartIndex query parameters starting
   * from the given record index and sorted by based on tag name in the order given by the
   * sortOrder query parameter. All the query parameters are optional. pageSize defaults to
   * 50.
   *
   *
   * @summary Get Company Photo and Video Tags
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getPhotoVideoTags(metadata?: types.GetPhotoVideoTagsMetadataParam): Promise<FetchResponse<200, types.PhotoVideoTagCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/photo-video-tags', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of 'active' Account Types for the current company.
   *
   *
   * @summary Get Company Active Account Types
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getActiveAccountTypes(): Promise<FetchResponse<200, types.CompanyAccountTypeCollection>> {
    return this.core.fetch('/company-settings/location-settings/account-types', 'get');
  }

  /**
   * Use this endpoint to get an account type by ID.
   *
   *
   * @summary Get Company Active Account Type by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAccountTypeById(metadata: types.GetAccountTypeByIdMetadataParam): Promise<FetchResponse<200, types.CompanyAccountType>> {
    return this.core.fetch('/company-settings/location-settings/account-types/{accountTypeId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of countries supported by the current company. This
   * endpoint will return a paginated response starting from the given record index.
   *
   *
   * @summary Get Company Countries
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCompanySettingsLocationSettingsCountries(metadata?: types.GetCompanySettingsLocationSettingsCountriesMetadataParam): Promise<FetchResponse<200, types.CompanyCountriesCollection>> {
    return this.core.fetch('/company-settings/location-settings/countries', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of the states supported by the current company.
   * CountryId must be an existing country supported by the current company. This endpoint
   * will return a paginated response starting from the given record index. StartIndex starts
   * at 0. Default PageSize is 100. Pagination parameters are optional.
   *
   *
   * @summary Get Company States
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getcompanySettingsLocationSettingsCountriesCountryIdStates(metadata: types.GetcompanySettingsLocationSettingsCountriesCountryIdStatesMetadataParam): Promise<FetchResponse<200, types.CompanyStatesCollection>> {
    return this.core.fetch('/company-settings/location-settings/countries/{countryId}/states', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of insurance companies for the current location.  The
   * response is paginated based on the pageSize and StartIndex query parameters and sorted
   * by based on tag name in the order given by the sortOrder query parameter.  All the query
   * parameters are optional.  pageSize defaults to 50 and StartIndex defaults to 0.
   *
   *
   * @summary Get Insurance Companies
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getInsuranceCompanies(metadata?: types.GetInsuranceCompaniesMetadataParam): Promise<FetchResponse<200, types.InsuranceCompanyCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/insurance-companies', 'get', metadata);
  }

  /**
   * Use this endpoint to get all the Job Categories for a company. StartIndex starts at 0.
   * Default PageSize is 25. Pagination parameters are optional. Only active job category
   * values are returned.
   *
   *
   * @summary Get Job Categories of the Company
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCompanySettingsJobSettingsJobCategories(metadata?: types.GetCompanySettingsJobSettingsJobCategoriesMetadataParam): Promise<FetchResponse<200, types.JobCategoriesCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/job-categories', 'get', metadata);
  }

  /**
   * Use this endpoint to get all the Trade Types for a company. StartIndex starts at 0.
   * Default PageSize is 25. Pagination parameters are optional. This endpoint will return a
   * paginated response starting from the given record index. Only active trade type values
   * are returned.
   *
   *
   * @summary Get Trade Types of the Company
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCompanySettingsJobSettingsTradeTypes(metadata?: types.GetCompanySettingsJobSettingsTradeTypesMetadataParam): Promise<FetchResponse<200, types.CompanyTradeTypeCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/trade-types', 'get', metadata);
  }

  /**
   * Use this endpoint to get all the Work Types for a company. StartIndex starts at 0.
   * Default PageSize is 100. Pagination parameters are optional. Only active work type
   * values are returned.
   *
   *
   * @summary Get Work Types of a Company
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getCompanySettingsJobSettingsWorkTypes(metadata?: types.GetCompanySettingsJobSettingsWorkTypesMetadataParam): Promise<FetchResponse<200, types.WorkTypeCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/work-types', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of active lead sources for the current location. This
   * will return the complete lead sources list available for the current location. Inactive
   * lead sources won't be returned. StartIndex starts at 0. Default PageSize is 25.
   * Pagination parameters are optional.
   *
   *
   * @summary Get Active Lead Sources for a Company
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getActiveLeadSources(metadata?: types.GetActiveLeadSourcesMetadataParam): Promise<FetchResponse<200, types.LeadSourcesCollection>> {
    return this.core.fetch('/company-settings/leads/lead-sources', 'get', metadata);
  }

  /**
   * Use this endpoint to get a lead source for the current location. This will return a lead
   * source available for the current location.
   *
   *
   * @summary Get Company Lead Source by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getLeadSourceById(metadata: types.GetLeadSourceByIdMetadataParam): Promise<FetchResponse<200, types.LeadSource>> {
    return this.core.fetch('/company-settings/leads/lead-sources/{leadSourceId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a child lead source for the current location. This will return
   * a child lead source available for the current location.
   *
   *
   * @summary Get Company Child Lead Source by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getLeadSourceChildById(metadata: types.GetLeadSourceChildByIdMetadataParam): Promise<FetchResponse<200, types.LeadSourceChild>> {
    return this.core.fetch('/company-settings/leads/lead-sources/{leadSourceParentId}/children/{leadSourceId}', 'get', metadata);
  }

  /**
   * Get milestones related to company. For including statuses, the company must have enabled
   * custom workflows.
   * **Supported includes:** `status`.
   *
   *
   * @summary Get Milestones
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getMilestones(metadata?: types.GetMilestonesMetadataParam): Promise<FetchResponse<200, types.WorkflowMilestoneCollection>> {
    return this.core.fetch('/company-settings/job-file-settings/workflow-milestones', 'get', metadata);
  }

  /**
   * Get statuses for a milestone.
   *
   *
   * @summary Get Statuses for a Milestone
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getStatusesForMilestone(metadata: types.GetStatusesForMilestoneMetadataParam): Promise<FetchResponse<200, types.WorkflowMilestoneStatusItem>> {
    return this.core.fetch('/company-settings/job-file-settings/workflow-milestones/{milestone}/statuses', 'get', metadata);
  }

  /**
   * Use this endpoint to get a listing of Contacts. **Supported includes:** `emailAddress`,
   * `phoneNumber`.
   *
   *
   * @summary Get Contacts
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getContacts(metadata?: types.GetContactsMetadataParam): Promise<FetchResponse<200, types.ContactCollection>> {
    return this.core.fetch('/contacts', 'get', metadata);
  }

  /**
   * Use this endpoint to create a new contact.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Contact
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<429, types.PostContactsResponse429> Too Many Requests
   */
  postContacts(body?: types.ContactPost): Promise<FetchResponse<201, types.ContactLink>> {
    return this.core.fetch('/contacts', 'post', body);
  }

  /**
   * Use this endpoint to get the list of contact types from a company.
   *
   *
   * @summary Get Contact Types
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getContactTypes(metadata?: types.GetContactTypesMetadataParam): Promise<FetchResponse<200, types.ContactTypesCollection>> {
    return this.core.fetch('/contacts/contact-types', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of contacts matching the given search criteria. Contacts
   * are returned if they include a given first name, last name, company name, and contact
   * type. it will filter by range of dates, using the CreationDate of the contact. The size
   * of the return is controlled with the pageSize query parameter which defaults to 25 and
   * must be > 0 and <= 25. Set pageIndex > 0 to access contacts past the first page when
   * more than pageSize contacts meet the search criteria. Sort criteria, startDate and
   * endDate are required. The search returns includes like phone numbers, email addresses
   * and location address.
   *
   *
   * @summary Search Contacts
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  postContactSearch(body: types.ContactSearchPost, metadata?: types.PostContactSearchMetadataParam): Promise<FetchResponse<200, types.ContactCollection>> {
    return this.core.fetch('/contacts/search', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get details for a specific contact. **Supported includes:**
   * `emailAddress`, `phoneNumber`.
   *
   *
   * @summary Get Contact by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getContact(metadata: types.GetContactMetadataParam): Promise<FetchResponse<200, types.Contact>> {
    return this.core.fetch('/contacts/{contactId}', 'get', metadata);
  }

  /**
   * This endpoint updates the information for an existing contact.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Contact
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutContactResponse429> Too Many Requests
   */
  putContact(body: types.ContactPut, metadata: types.PutContactMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/contacts/{contactId}', 'put', body, metadata);
  }

  /**
   * Get a list of all custom fields related to a specific contact by its contact Id. This
   * endpoint will return a paginated response starting from the given record index.
   * StartIndex starts at 0. Default PageSize is 25. Pagination parameters are optional.
   *
   *
   * @summary Get Contact Custom Fields
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getContactCustomFields(metadata: types.GetContactCustomFieldsMetadataParam): Promise<FetchResponse<200, types.CustomFieldsCollection>> {
    return this.core.fetch('/contacts/{contactId}/custom-fields', 'get', metadata);
  }

  /**
   * Use this endpoint to update multiple custom field values for a contact.
   * The limit of the Custom Field list to update cannot be greater than 120.
   * If the custom field type is Text, the maximum lenght of the text is 500 characters.
   * Any text beyond that limit will be truncated.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Contact Custom Fields
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   * @throws FetchError<429, types.PutContactCustomFieldsResponse429> Too Many Requests
   */
  putContactCustomFields(body: types.ContactCustomFieldsBodyPut, metadata: types.PutContactCustomFieldsMetadataParam): Promise<FetchResponse<number, unknown>>;
  putContactCustomFields(metadata: types.PutContactCustomFieldsMetadataParam): Promise<FetchResponse<number, unknown>>;
  putContactCustomFields(body?: types.ContactCustomFieldsBodyPut | types.PutContactCustomFieldsMetadataParam, metadata?: types.PutContactCustomFieldsMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/contacts/{contactId}/custom-fields', 'put', body, metadata);
  }

  /**
   * Get a custom field object inside a contact provided a custom field id and a valid
   * contact id
   *
   *
   * @summary Get Contact Custom Field
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getContactCustomFieldById(metadata: types.GetContactCustomFieldByIdMetadataParam): Promise<FetchResponse<200, types.CustomField>> {
    return this.core.fetch('/contacts/{contactId}/custom-fields/{customFieldId}', 'get', metadata);
  }

  /**
   * Sets a value for the specified custom field in the contact.
   * If the custom field type is Text, the maximum lenght of the text is 500 characters.
   * Any text beyond that limit will be truncated.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Contact Custom Field
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutContactCustomFieldByIdResponse429> Too Many Requests
   */
  putContactCustomFieldById(body: types.CustomFieldBodyPut, metadata: types.PutContactCustomFieldByIdMetadataParam): Promise<FetchResponse<number, unknown>>;
  putContactCustomFieldById(metadata: types.PutContactCustomFieldByIdMetadataParam): Promise<FetchResponse<number, unknown>>;
  putContactCustomFieldById(body?: types.CustomFieldBodyPut | types.PutContactCustomFieldByIdMetadataParam, metadata?: types.PutContactCustomFieldByIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/contacts/{contactId}/custom-fields/{customFieldId}', 'put', body, metadata);
  }

  /**
   * Use this endpoint to get the list of email addresses for a specific contact.
   *
   *
   * @summary Get Email Addresses
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getContactEmailAddresses(metadata: types.GetContactEmailAddressesMetadataParam): Promise<FetchResponse<200, types.EmailAddressCollection>> {
    return this.core.fetch('/contacts/{contactId}/email-addresses', 'get', metadata);
  }

  /**
   * Use this endpoint to add an email address to the list of addresses for a specific
   * contact.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Email Address
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostContactEmailAddressesResponse429> Too Many Requests
   */
  postContactEmailAddresses(body: types.EmailAddressPost, metadata: types.PostContactEmailAddressesMetadataParam): Promise<FetchResponse<201, types.EmailAddressLink>> {
    return this.core.fetch('/contacts/{contactId}/email-addresses', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get the email addresses for a specific emailId associated with a
   * specific contact.
   *
   *
   * @summary Get Email Address
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getContactEmailAddressById(metadata: types.GetContactEmailAddressByIdMetadataParam): Promise<FetchResponse<200, types.EmailAddress>> {
    return this.core.fetch('/contacts/{contactId}/email-addresses/{emailId}', 'get', metadata);
  }

  /**
   * Retrieves a paginated list of all jobs that the contact is associated with.
   *
   * **Pagination:**
   * - PageStartIndex: Zero-based index of the first record to return (default: 0)
   * - PageSize: Number of records per page (default: 25, max: 50)
   * - Both pagination parameters are optional
   *
   * **Behavior:**
   * - Returns 200 with an empty items array if the contact exists but has no jobs associated
   * - Returns 400 if any path or a query string parameter (contactId, pageSize,
   * pageStartIndex) doesn't fulfill the validations
   * - Returns 404 if the contactId does not exist
   * - Returns 416 if pageStartIndex or pageSize are negative, or exceeds the maximum allowed
   * - Returns 500 if an internal error occurs.
   *
   *
   * @summary Get Jobs for a Contact
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   * @throws FetchError<500, types.Error> Internal Server Error. The issue has been logged and will be reviewed as soon as
   * possible.
   */
  getContactJobs(metadata: types.GetContactJobsMetadataParam): Promise<FetchResponse<200, types.ContactJobCollection>> {
    return this.core.fetch('/contacts/{contactId}/jobs', 'get', metadata);
  }

  /**
   * Use this endpoint to get the list of phone numbers for a specific contact.
   *
   *
   * @summary Get Phone Numbers
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getContactPhoneNumber(metadata: types.GetContactPhoneNumberMetadataParam): Promise<FetchResponse<200, types.PhoneNumberCollection>> {
    return this.core.fetch('/contacts/{contactId}/phone-numbers', 'get', metadata);
  }

  /**
   * Use this endpoint to add a phone number to the list of phone numbers for a specific
   * contact.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Phone Number
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostContactPhoneNumberResponse429> Too Many Requests
   */
  postContactPhoneNumber(body: types.PhoneNumberPost, metadata: types.PostContactPhoneNumberMetadataParam): Promise<FetchResponse<201, types.PhoneNumberLink>> {
    return this.core.fetch('/contacts/{contactId}/phone-numbers', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get the phone number for a specific phoneId associated with a
   * specific contact.
   *
   *
   * @summary Get Phone Number
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getContactPhoneNumberById(metadata: types.GetContactPhoneNumberByIdMetadataParam): Promise<FetchResponse<200, types.PhoneNumber>> {
    return this.core.fetch('/contacts/{contactId}/phone-numbers/{phoneId}', 'get', metadata);
  }

  /**
   * Use this endpoint to create a new Log for an existing contact.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Contact Log
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostContactLogResponse429> Too Many Requests
   */
  postContactLog(body: types.ContactLogPost, metadata: types.PostContactLogMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/contacts/{contactId}/logs', 'post', body, metadata);
  }

  /**
   * Creates a new note entry associated with a specific contact.
   *
   * **Required Fields:**
   * - `note`: The body text of the note (max 1000 characters).
   *
   * **Behavior:**
   * - Returns 201 with empty body.
   * - Returns 400 if required fields are missing or fail validation constraints.
   * - Returns 401 if the caller is not authenticated.
   * - Returns 404 if the contactId does not exist.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Contact Note
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostContactNotesResponse429> Too Many Requests
   */
  postContactNotes(body: types.ContactNotePost, metadata: types.PostContactNotesMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/contacts/{contactId}/notes', 'post', body, metadata);
  }

  /**
   * Use this endpoint to verify that the API server is responsive.
   *
   *
   * @summary Check if the API Server Is Responsive
   * @throws FetchError<400, types.Error> Bad Request
   */
  getPing(): Promise<FetchResponse<200, types.Date>> {
    return this.core.fetch('/diagnostics/ping', 'get');
  }

  /**
   * Use this endpoint to get all estimates for the current location. **Supported includes:**
   * `job`.
   *
   *
   * @summary Get Estimates
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getEstimates(metadata?: types.GetEstimatesMetadataParam): Promise<FetchResponse<200, types.EstimateCollection>> {
    return this.core.fetch('/estimates', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific estimate. **Supported includes:** `job`,
   * `createdBy`, `modifiedBy`, `sections`.
   *
   *
   * @summary Get Estimate
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getEstimateById(metadata: types.GetEstimateByIdMetadataParam): Promise<FetchResponse<200, types.Estimate>> {
    return this.core.fetch('/estimates/{estimateId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get all sections for the given estimate. **Supported includes:**
   * `createdBy`, `modifiedBy`, `items`.
   *
   *
   * @summary Get Estimate Sections
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getEstimateSections(metadata: types.GetEstimateSectionsMetadataParam): Promise<FetchResponse<200, types.EstimateSectionCollection>> {
    return this.core.fetch('/estimates/{estimateId}/sections', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific estimate section. **Supported includes:**
   * `createdBy`, `modifiedBy`, `items`.
   *
   *
   * @summary Get Estimate Section
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getEstimateSectionById(metadata: types.GetEstimateSectionByIdMetadataParam): Promise<FetchResponse<200, types.EstimateSection>> {
    return this.core.fetch('/estimates/{estimateId}/sections/{estimateSectionId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get all items for the given estimate section.
   *
   *
   * @summary Get Estimate Section Items
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getEstimateSectionItems(metadata: types.GetEstimateSectionItemsMetadataParam): Promise<FetchResponse<200, types.EstimateItemCollection>> {
    return this.core.fetch('/estimates/{estimateId}/sections/{estimateSectionId}/items', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific estimate item.
   *
   *
   * @summary Get Estimate Section Item
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getEstimateSectionItem(metadata: types.GetEstimateSectionItemMetadataParam): Promise<FetchResponse<200, types.EstimateItem>> {
    return this.core.fetch('/estimates/{estimateId}/sections/{estimateSectionId}/items/{estimateItemId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a listing of Jobs.
   *
   * When startDate and endDate are specified, jobs returned will be filtered to the given
   * date range (inclusive).
   *
   * The date field to filter on is given with dateFilterType which defaults to CreatedDate.
   *
   * Optionally use milestones to limit the jobs to those in the listed milestones.
   *
   * Optionally use sortBy to sort jobs by either CreatedDate, MilestoneDate, or
   * ModifiedDate. CreatedDate is the default.
   *
   * Optionally use sortOrder to indicate newest to oldest (Descending) ordering or oldest to
   * newest (Ascending) ordering. Ascending is the default.
   *
   * The pageStartIndex parameter to start looking for records should not exceed 100000
   *
   * **To Get Jobs:**
   *
   * **Supported includes:** `contact`, `initialAppointment`.
   *
   * Example: return the jobs (including initial appointment) that are prospects and were
   * modified in April sorted most recent first (descending ModifiedDate).
   *
   * *\/jobs?pageSize=25&includes=initialAppointment&filterByDate=ModifiedDate&startDate=2021-04-01&endDate=2021-04-30&sortBy=ModifiedDate&sortOrder=Descending*
   *
   *
   * **To Get Unassigned Jobs:**
   *
   * **Supported includes:** `contact`.
   *
   * Example: return the unassigned jobs (including contacts) that were modified in March
   * sorted most recent first (descending ModifiedDate)
   *
   * *\/jobs?assignment=unassigned&pageSize=25&includes=contacts&filterByDate=ModifiedDate&startDate=2025-03-01&endDate=2025-03-30&sortBy=ModifiedDate&sortOrder=Descending*
   *
   * *jobs?assignment=unassigned&milestones=Lead&pageSize=25&includes=contacts&filterByDate=ModifiedDate&startDate=2025-03-01&endDate=2025-03-30*
   *
   *
   * Example: return the unassigned jobs (including contacts) that were marked as Dead
   *
   * *\/jobs?assignment=unassigned&milestones=Dead&pageSize=25&includes=contacts&filterByDate=ModifiedDate&startDate=2025-03-01&endDate=2025-03-30*
   *
   *
   * @summary Get Jobs
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getJobs(metadata?: types.GetJobsMetadataParam): Promise<FetchResponse<200, types.JobCollection>> {
    return this.core.fetch('/jobs', 'get', metadata);
  }

  /**
   * Use this endpoint to create a job in the milestone Lead (Unassigned).
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Job
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.CreateJobResponse429> Too Many Requests
   */
  createJob(body: types.JobPost): Promise<FetchResponse<201, types.CreateJobResponse201>> {
    return this.core.fetch('/jobs', 'post', body);
  }

  /**
   * Use this endpoint to get a external reference based on the following query parameters:
   * - `jobId`
   * - `projectId` * case insensitive
   * - `source` * mandatory & case insensitive
   * - `jobId` and `projectId` are optional, but at least one of them are needed in the
   * request.
   *
   *
   * @summary Get Job External References
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getJobExternalReferences(metadata: types.GetJobExternalReferencesMetadataParam): Promise<FetchResponse<200, types.ExternalReferenceList>> {
    return this.core.fetch('/jobs/external-references', 'get', metadata);
  }

  /**
   * Use this endpoint to create a new external reference for a job to an external source and
   * project.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Job External Reference
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostCreateJobExternalReferenceResponse429> Too Many Requests
   */
  postCreateJobExternalReference(body: types.CreateExternalReferenceBodyPost): Promise<FetchResponse<201, types.ExternalReference>> {
    return this.core.fetch('/jobs/external-references', 'post', body);
  }

  /**
   * Use this endpoint to get a listing of jobs matching the given search criteria. Jobs are
   * returned if they include a given search term and/or they are near a given set of map
   * coordinates. At least one of searchTerm or geoLocation must be included. If both are
   * included, jobs returned must match both criteria.
   *
   * The size of the return is controlled with the pageSize query parameter which defaults to
   * 10 and must be > 0 and <= 25. Set StartIndex >= 0 to access jobs past the first page
   * when more than pageSize jobs meet the search criteria. The StartIndex parameter to start
   * looking for records should not exceed 100000.
   *
   * Unassigned leads or jobs will not be returned.
   *
   * **Supported includes:** `contact`, `initialAppointment`.
   *
   * Example: return up to 25 jobs (including initial appointment) that contain "Maple Lane"
   * and are within 1 kilometer of the map location (40.689247,-74.044502).
   *
   * **\/jobs/search?pageSize=25&includes=initialAppointment**
   * ```
   * {
   *   "searchTerm": "Maple Lane",
   *   "geoLocation": {
   *     "latitude": 40.689247,
   *     "longitude": -74.044502,
   *     "mapRadius": 1
   *   }
   * }
   * ```
   *
   *
   * @summary Search Jobs
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  searchJobs(body?: types.JobSearchPost, metadata?: types.SearchJobsMetadataParam): Promise<FetchResponse<200, types.JobCollection>> {
    return this.core.fetch('/jobs/search', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get details for a specific job. Unassigned leads or jobs will not
   * be returned. **Supported includes:** `contact`, `initialAppointment`.
   *
   *
   * @summary Get Job by ID
   */
  getJob(metadata: types.GetJobMetadataParam): Promise<FetchResponse<200, types.Job>> {
    return this.core.fetch('/jobs/{jobId}', 'get', metadata);
  }

  /**
   * This endpoint updates the job location address information.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Address
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutJobLocationAddressResponse429> Too Many Requests
   */
  putJobLocationAddress(body: types.JobAddressPut, metadata: types.PutJobLocationAddressMetadataParam): Promise<FetchResponse<number, unknown>>;
  putJobLocationAddress(metadata: types.PutJobLocationAddressMetadataParam): Promise<FetchResponse<number, unknown>>;
  putJobLocationAddress(body?: types.JobAddressPut | types.PutJobLocationAddressMetadataParam, metadata?: types.PutJobLocationAddressMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/address', 'put', body, metadata);
  }

  /**
   * This endpoint returns the job's insurance adjuster information.
   *
   *
   * @summary Get Job Adjuster
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getAdjusterForJob(metadata: types.GetAdjusterForJobMetadataParam): Promise<FetchResponse<200, types.JobAdjuster>> {
    return this.core.fetch('/jobs/{jobId}/adjuster', 'get', metadata);
  }

  /**
   * This endpoint sets or updates the job adjuster information.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Adjuster
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutAdjusterForJobResponse429> Too Many Requests
   */
  putAdjusterForJob(body: types.JobAdjuster, metadata: types.PutAdjusterForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putAdjusterForJob(metadata: types.PutAdjusterForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putAdjusterForJob(body?: types.JobAdjuster | types.PutAdjusterForJobMetadataParam, metadata?: types.PutAdjusterForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/adjuster', 'put', body, metadata);
  }

  /**
   * Use this endpoint to get the list of contacts for a job. **Supported includes:**
   * `contact`.
   *
   *
   * @summary Get Job Contacts
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getJobContacts(metadata: types.GetJobContactsMetadataParam): Promise<FetchResponse<200, types.JobContactCollection>> {
    return this.core.fetch('/jobs/{jobId}/contacts', 'get', metadata);
  }

  /**
   * Use this endpoint to get details of a specific job contact. **Supported includes:**
   * `contact`.
   *
   *
   * @summary Get Job Contact by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getJobContact(metadata: types.GetJobContactMetadataParam): Promise<FetchResponse<200, types.JobContact>> {
    return this.core.fetch('/jobs/{jobId}/contacts/{jobContactId}', 'get', metadata);
  }

  /**
   * Get a list of all custom fields related to a specific job by its job Id.
   * This endpoint will return a paginated response starting from the given record index.
   * StartIndex starts at 0. Default PageSize is 25. Pagination parameters are optional.
   *
   *
   * @summary Get Job Custom Fields
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getJobCustomFields(metadata: types.GetJobCustomFieldsMetadataParam): Promise<FetchResponse<200, types.CustomFieldsCollection>> {
    return this.core.fetch('/jobs/{jobId}/custom-fields', 'get', metadata);
  }

  /**
   * Use this endpoint to update multiple custom field values for a Job.
   * The limit of the Custom Field list to update cannot be greater than 120.
   * If the custom field type is Text, the maximum lenght of the text is 500 characters.
   * Any text beyond that limit that will be truncated.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Custom Fields
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   * @throws FetchError<429, types.PutJobCustomFieldsResponse429> Too Many Requests
   */
  putJobCustomFields(body: types.JobCustomFieldsBodyPut, metadata: types.PutJobCustomFieldsMetadataParam): Promise<FetchResponse<number, unknown>>;
  putJobCustomFields(metadata: types.PutJobCustomFieldsMetadataParam): Promise<FetchResponse<number, unknown>>;
  putJobCustomFields(body?: types.JobCustomFieldsBodyPut | types.PutJobCustomFieldsMetadataParam, metadata?: types.PutJobCustomFieldsMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/custom-fields', 'put', body, metadata);
  }

  /**
   * Get a custom field object inside a job, provided a custom field ID and a valid job ID
   *
   *
   * @summary Get Job Custom Field by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getJobCustomFieldById(metadata: types.GetJobCustomFieldByIdMetadataParam): Promise<FetchResponse<200, types.CustomField>> {
    return this.core.fetch('/jobs/{jobId}/custom-fields/{customFieldId}', 'get', metadata);
  }

  /**
   * Sets a value for the specified custom field in the Job.
   * If the custom field type is Text, the maximum lenght of the text is 500 characters.
   * Any text beyond that limit will be truncated.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Custom Field by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutJobCustomFieldByIdResponse429> Too Many Requests
   */
  putJobCustomFieldById(body: types.CustomFieldBodyPut, metadata: types.PutJobCustomFieldByIdMetadataParam): Promise<FetchResponse<number, unknown>>;
  putJobCustomFieldById(metadata: types.PutJobCustomFieldByIdMetadataParam): Promise<FetchResponse<number, unknown>>;
  putJobCustomFieldById(body?: types.CustomFieldBodyPut | types.PutJobCustomFieldByIdMetadataParam, metadata?: types.PutJobCustomFieldByIdMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/custom-fields/{customFieldId}', 'put', body, metadata);
  }

  /**
   * Use this endpoint to add a job document for a specific job.  Special characters and
   * spaces will be removed from the file name before upload.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Add Job Document
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostAddJobDocumentResponse429> Too Many Requests
   */
  postAddJobDocument(body: types.AddJobDocumentPost, metadata: types.PostAddJobDocumentMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/documents', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get a list of estimates for the specified job. This endpoint will
   * return a paginated response starting from the given record index.
   *
   *
   * @summary Get Job Estimates
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getEstimatesForJob(metadata: types.GetEstimatesForJobMetadataParam): Promise<FetchResponse<200, types.EstimateCollection>> {
    return this.core.fetch('/jobs/{jobId}/estimates', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of invoices for the specified job.
   *
   *
   * @summary Get Job Invoices
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getInvoicesForJob(metadata: types.GetInvoicesForJobMetadataParam): Promise<FetchResponse<200, types.InvoiceCollection>> {
    return this.core.fetch('/jobs/{jobId}/invoices', 'get', metadata);
  }

  /**
   * Use this endpoint to get the Financials for the specified job. **Supported includes:**
   * `worksheet`, `amendments`.
   *
   *
   * @summary Get Job Financials
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getFinancialsForJob(metadata: types.GetFinancialsForJobMetadataParam): Promise<FetchResponse<200, types.Financials>> {
    return this.core.fetch('/jobs/{jobId}/financials', 'get', metadata);
  }

  /**
   * Use this endpoint to get status of the accounting integration sync for the specified
   * job.
   *
   *
   * @summary Get Job Accounting Integration Status
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAccountingIntegrationsSyncChangesForJob(metadata: types.GetAccountingIntegrationsSyncChangesForJobMetadataParam): Promise<FetchResponse<200, types.AccountingIntegrationStatus>> {
    return this.core.fetch('/jobs/{jobId}/accounting/integration-status', 'get', metadata);
  }

  /**
   * Use this endpoint to get a history of actions performed for a job. **Supported
   * includes:** `createdBy`. When startDate and endDate are specified, actions returned will
   * be filtered to those created between those dates (inclusive). This endpoint will return
   * a paginated response starting from the given record index.
   *
   *
   * @summary Get Job Change History
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getJobHistory(metadata: types.GetJobHistoryMetadataParam): Promise<FetchResponse<200, types.JobActionCollection>> {
    return this.core.fetch('/jobs/{jobId}/history', 'get', metadata);
  }

  /**
   * Use this endpoint to get the initial appointment for a job.
   *
   *
   * @summary Get Job Initial Appointment
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getInitialAppointmentForJob(metadata: types.GetInitialAppointmentForJobMetadataParam): Promise<FetchResponse<200, types.InitialAppointment>> {
    return this.core.fetch('/jobs/{jobId}/initial-appointment', 'get', metadata);
  }

  /**
   * Use this endpoint to add or modify the initial appointment for a job. All datetimes
   * should be UTC and in ISO 8601 format (suffixed with 'Z').
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Initial Appointment
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   * @throws FetchError<429, types.PutInitialAppointmentForJobResponse429> Too Many Requests
   */
  putInitialAppointmentForJob(body: types.InitialAppointmentPut, metadata: types.PutInitialAppointmentForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putInitialAppointmentForJob(metadata: types.PutInitialAppointmentForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putInitialAppointmentForJob(body?: types.InitialAppointmentPut | types.PutInitialAppointmentForJobMetadataParam, metadata?: types.PutInitialAppointmentForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/initial-appointment', 'put', body, metadata);
  }

  /**
   * Use this endpoint to remove the Initial Appointment assigned to an existing job.
   * The job must have an initial appointment date previously set.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Delete Job Initial Appointment
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.DeleteJobInitialAppointmentResponse429> Too Many Requests
   */
  deleteJobInitialAppointment(body: types.InitialAppointmentDelete, metadata: types.DeleteJobInitialAppointmentMetadataParam): Promise<FetchResponse<number, unknown>>;
  deleteJobInitialAppointment(metadata: types.DeleteJobInitialAppointmentMetadataParam): Promise<FetchResponse<number, unknown>>;
  deleteJobInitialAppointment(body?: types.InitialAppointmentDelete | types.DeleteJobInitialAppointmentMetadataParam, metadata?: types.DeleteJobInitialAppointmentMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/initial-appointment', 'delete', body, metadata);
  }

  /**
   * This endpoint returns the job's insurance information.
   *
   *
   * @summary Get Job Insurance
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getInsuranceForJob(metadata: types.GetInsuranceForJobMetadataParam): Promise<FetchResponse<200, types.JobInsurance>> {
    return this.core.fetch('/jobs/{jobId}/insurance', 'get', metadata);
  }

  /**
   * This endpoint sets the insurance information for an existing job.
   * - "Insurance company" section:
   *   It can be set by ID or by name, but not both.
   *   The ID should belong to the existing insurance companies. If the name is used it will
   * be assigned to "Other" (active) insurance company.
   *   Set them as not assigned can be done, just sending both(ID & name) null or empty will
   * do it.
   * - dateOfLoss & claimFiledDate should be UTC and in ISO 8601 format (suffixed with 'Z').
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Insurance
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutInsuranceInformationForJobResponse429> Too Many Requests
   */
  putInsuranceInformationForJob(body: types.JobInsurancePut, metadata: types.PutInsuranceInformationForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putInsuranceInformationForJob(metadata: types.PutInsuranceInformationForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putInsuranceInformationForJob(body?: types.JobInsurancePut | types.PutInsuranceInformationForJobMetadataParam, metadata?: types.PutInsuranceInformationForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/insurance', 'put', body, metadata);
  }

  /**
   * This endpoint sets an insurance company to an existing job. It can be set by ID or by
   * name, but not both. The ID should belong to the existing insurance companies. If the
   * name is used it will be assigned to "Other" (active) insurance company. Set them as not
   * assigned can be done, just sending both(ID & name) null or empty will do it.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Insurance Company
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   * @throws FetchError<429, types.PutInsuranceCompanyForJobResponse429> Too Many Requests
   */
  putInsuranceCompanyForJob(body: types.JobInsuranceCompanyPut, metadata: types.PutInsuranceCompanyForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putInsuranceCompanyForJob(metadata: types.PutInsuranceCompanyForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  putInsuranceCompanyForJob(body?: types.JobInsuranceCompanyPut | types.PutInsuranceCompanyForJobMetadataParam, metadata?: types.PutInsuranceCompanyForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/insurance/insurance-company', 'put', body, metadata);
  }

  /**
   * Use this endpoint to create a job message. Please note that the message will only be
   * created as a comment.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Job Message
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostCreateJobMessageResponse429> Too Many Requests
   */
  postCreateJobMessage(body: types.CreateJobMessagePost, metadata: types.PostCreateJobMessageMetadataParam): Promise<FetchResponse<201, types.JobMessage>> {
    return this.core.fetch('/jobs/{jobId}/messages', 'post', body, metadata);
  }

  /**
   * Use this endpoint to reply to an existing job message. Please note that the message will
   * only be created as a comment.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Job Message Reply
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostReplyJobMessageResponse429> Too Many Requests
   */
  postReplyJobMessage(body: types.CreateJobMessageReplyPost, metadata: types.PostReplyJobMessageMetadataParam): Promise<FetchResponse<201, types.JobMessage>> {
    return this.core.fetch('/jobs/{jobId}/messages/{messageId}/replies', 'post', body, metadata);
  }

  /**
   * Get milestone history for the specified Job.
   *
   *
   * @summary Get Job Milestone History
   */
  getMilestonesForJob(metadata: types.GetMilestonesForJobMetadataParam): Promise<FetchResponse<200, types.MilestoneCollection>> {
    return this.core.fetch('/jobs/{jobId}/milestone-history', 'get', metadata);
  }

  /**
   * Get a single milestone information by id. For including statuses the company must have
   * enabled custom workflows. **Supported includes:** `status`.
   *
   *
   * @summary Get Job Milestone by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getJobMilestoneById(metadata: types.GetJobMilestoneByIdMetadataParam): Promise<FetchResponse<200, types.JobMilestone>> {
    return this.core.fetch('/jobs/{jobId}/milestones/{milestoneId}', 'get', metadata);
  }

  /**
   * Get a single status information by ID.
   *
   *
   * @summary Get Job Milestone Status by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getJobStatusById(metadata: types.GetJobStatusByIdMetadataParam): Promise<FetchResponse<200, types.JobMilestoneStatus>> {
    return this.core.fetch('/jobs/{jobId}/milestones/{milestoneId}/status/{statusId}', 'get', metadata);
  }

  /**
   * Get the current milestone information. For including statuses the company must have
   * enabled custom workflows. **Supported includes:** `status`.
   *
   *
   * @summary Get Current Job Milestone
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   */
  getCurrentJobMilestone(metadata: types.GetCurrentJobMilestoneMetadataParam): Promise<FetchResponse<200, types.JobMilestone>> {
    return this.core.fetch('/jobs/{jobId}/milestones/current', 'get', metadata);
  }

  /**
   * Returns all payment records associated with the specified job, organized into three
   * groups: received payments (amounts collected from the customer), paid payments (amounts
   * paid to vendors or subcontractors), and additional expenses. Each group includes the
   * total sum of its item amounts. Payments may be structured as parent payments with one or
   * more sub-payments; sub-payments reference their parent via the `parentId` field.
   *
   *
   * @summary Get Job Payments
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getPayments(metadata: types.GetPaymentsMetadataParam): Promise<FetchResponse<200, types.JobPayments>> {
    return this.core.fetch('/jobs/{jobId}/payments', 'get', metadata);
  }

  /**
   * Use this endpoint to get a high-level overview of financial information for the
   * specified job.
   *
   *
   * @summary Get Job Payments Overview
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getPaymentsOverviewForJob(metadata: types.GetPaymentsOverviewForJobMetadataParam): Promise<FetchResponse<200, types.PaymentOverview>> {
    return this.core.fetch('/jobs/{jobId}/payments/overview', 'get', metadata);
  }

  /**
   * Use this endpoint to create a new payment received.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Received Payment
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostCreatePaymentReceivedResponse429> Too Many Requests
   */
  postCreatePaymentReceived(body: types.PaymentReceived, metadata: types.PostCreatePaymentReceivedMetadataParam): Promise<FetchResponse<201, types.PaymentLink>> {
    return this.core.fetch('/jobs/{jobId}/payments/received', 'post', body, metadata);
  }

  /**
   * Use this endpoint to create a new payment paid.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Paid Payment
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostCreatePaymentPaidResponse429> Too Many Requests
   */
  postCreatePaymentPaid(body: types.PaymentPaid, metadata: types.PostCreatePaymentPaidMetadataParam): Promise<FetchResponse<201, types.PaymentLink>> {
    return this.core.fetch('/jobs/{jobId}/payments/paid', 'post', body, metadata);
  }

  /**
   * Use this endpoint to create a new payment Additional Job Expenses.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Additional Job Expense
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   * @throws FetchError<429, types.PostCreatePaymentAdditionalExpenseResponse429> Too Many Requests
   */
  postCreatePaymentAdditionalExpense(body: types.PaymentAdditionalExpense, metadata: types.PostCreatePaymentAdditionalExpenseMetadataParam): Promise<FetchResponse<201, types.PaymentLink>>;
  postCreatePaymentAdditionalExpense(metadata: types.PostCreatePaymentAdditionalExpenseMetadataParam): Promise<FetchResponse<201, types.PaymentLink>>;
  postCreatePaymentAdditionalExpense(body?: types.PaymentAdditionalExpense | types.PostCreatePaymentAdditionalExpenseMetadataParam, metadata?: types.PostCreatePaymentAdditionalExpenseMetadataParam): Promise<FetchResponse<201, types.PaymentLink>> {
    return this.core.fetch('/jobs/{jobId}/payments/expense', 'post', body, metadata);
  }

  /**
   * This endpoint sets the priority for an existing job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Priority
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PutPriorityForJobResponse429> Too Many Requests
   */
  putPriorityForJob(body: types.JobPriorityPut, metadata: types.PutPriorityForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/priority', 'put', body, metadata);
  }

  /**
   * Use this endpoint to get the list of representatives for a Job. This endpoint will
   * return a paginated response starting from the given record index.
   *
   *
   * @summary Get Job Representatives
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getRepresentativesForJob(metadata: types.GetRepresentativesForJobMetadataParam): Promise<FetchResponse<200, types.CompanyRepresentativeCollection>> {
    return this.core.fetch('/jobs/{jobId}/representatives', 'get', metadata);
  }

  /**
   * Use this endpoint to get the company representative for a job.
   *
   *
   * @summary Get Job Company Representative
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getCompanyRepresentativeForJob(metadata: types.GetCompanyRepresentativeForJobMetadataParam): Promise<FetchResponse<200, types.CompanyRepresentative>> {
    return this.core.fetch('/jobs/{jobId}/representatives/company', 'get', metadata);
  }

  /**
   * Use this endpoint to update the company representative for a job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Company Representative
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostCompanyRepresentativeForJobResponse429> Too Many Requests
   */
  postCompanyRepresentativeForJob(body: types.IdPost, metadata: types.PostCompanyRepresentativeForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  postCompanyRepresentativeForJob(metadata: types.PostCompanyRepresentativeForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  postCompanyRepresentativeForJob(body?: types.IdPost | types.PostCompanyRepresentativeForJobMetadataParam, metadata?: types.PostCompanyRepresentativeForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/representatives/company', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get the sales owner for a job.
   *
   *
   * @summary Get Job Sales Owner
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getSalesOwnerForJob(metadata: types.GetSalesOwnerForJobMetadataParam): Promise<FetchResponse<200, types.CompanyRepresentative>> {
    return this.core.fetch('/jobs/{jobId}/representatives/sales-owner', 'get', metadata);
  }

  /**
   * Use this endpoint to add or update the sales owner for a job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Add or Update Sales Owner
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostSalesOwnerForJobResponse429> Too Many Requests
   */
  postSalesOwnerForJob(body: types.IdPost, metadata: types.PostSalesOwnerForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  postSalesOwnerForJob(metadata: types.PostSalesOwnerForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  postSalesOwnerForJob(body?: types.IdPost | types.PostSalesOwnerForJobMetadataParam, metadata?: types.PostSalesOwnerForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/representatives/sales-owner', 'post', body, metadata);
  }

  /**
   * Use this endpoint to remove the sales owner from a job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Delete Sales Owner
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.DeleteSalesOwnerFromJobResponse429> Too Many Requests
   */
  deleteSalesOwnerFromJob(metadata: types.DeleteSalesOwnerFromJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/representatives/sales-owner', 'delete', metadata);
  }

  /**
   * Use this endpoint to get the A/R representative for a job.
   *
   *
   * @summary Get Job A/R Owner
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getAROwnerForJob(metadata: types.GetArOwnerForJobMetadataParam): Promise<FetchResponse<200, types.CompanyRepresentative>> {
    return this.core.fetch('/jobs/{jobId}/representatives/ar-owner', 'get', metadata);
  }

  /**
   * Use this endpoint to add or update the A/R Owner for a job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Add or Update A/R Owner
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostArOwnerForJobResponse429> Too Many Requests
   */
  postAROwnerForJob(body: types.IdPost, metadata: types.PostArOwnerForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  postAROwnerForJob(metadata: types.PostArOwnerForJobMetadataParam): Promise<FetchResponse<number, unknown>>;
  postAROwnerForJob(body?: types.IdPost | types.PostArOwnerForJobMetadataParam, metadata?: types.PostArOwnerForJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/representatives/ar-owner', 'post', body, metadata);
  }

  /**
   * Use this endpoint to remove the A/R owner from a job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Delete A/R Owner
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.DeleteArOwnerFromJobResponse429> Too Many Requests
   */
  deleteAROwnerFromJob(metadata: types.DeleteArOwnerFromJobMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/representatives/ar-owner', 'delete', metadata);
  }

  /**
   * Use this endpoint to Upload a single Photo or Video for the specified job.  Special
   * characters and spaces will be removed from the file name before upload.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Upload Job Photo or Video
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostUploadPhotoOrVideoResponse429> Too Many Requests
   */
  postUploadPhotoOrVideo(body: types.JobPhotoVideoFormPost, metadata: types.PostUploadPhotoOrVideoMetadataParam): Promise<FetchResponse<number, unknown>>;
  postUploadPhotoOrVideo(metadata: types.PostUploadPhotoOrVideoMetadataParam): Promise<FetchResponse<number, unknown>>;
  postUploadPhotoOrVideo(body?: types.JobPhotoVideoFormPost | types.PostUploadPhotoOrVideoMetadataParam, metadata?: types.PostUploadPhotoOrVideoMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/photos-videos', 'post', body, metadata);
  }

  /**
   * - Use this endpoint to create one or more manual measurements using a list of
   * measurements entered in a file
   * - The measurements file must contain the measurements information for the measurements
   * to be created on the job. The file extension should be .json, and the content must be a
   * valid JSON structure.
   * - The JSON information will be created as new manual measurements; the data within the
   * JSON file will not be validated.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Job Manual Measurements
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostJobMeasurementsUploadResponse429> Too Many Requests
   */
  postJobMeasurementsUpload(body: types.JobMeasurementsPost, metadata: types.PostJobMeasurementsUploadMetadataParam): Promise<FetchResponse<202, types.JobMeasurement>> {
    return this.core.fetch('/jobs/{jobId}/measurements', 'post', body, metadata);
  }

  /**
   * Use this endpoint to create a measurements order with the external provider Information
   * for a specific job.
   * - The measurement file can be an XML or JSON file.
   *   - The file content has to be a valid XML or JSON structure.
   *   - The file must contain the measurements order information with the measurements to be
   * created.
   * - A report PDF can be attached.
   * - A list of PDF files can be attached.
   * - Special characters and spaces will be removed from all the file names before upload.
   * - The PDF files content will not be validated, only the type as PDF and the file size.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Job Measurements Order
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   * @throws FetchError<429, types.PostJobMeasurementsUploadFilesResponse429> Too Many Requests
   */
  postJobMeasurementsUploadFiles(body: types.JobMeasurementsPostFiles, metadata: types.PostJobMeasurementsUploadFilesMetadataParam): Promise<FetchResponse<202, types.JobMeasurement>> {
    return this.core.fetch('/jobs/{jobId}/measurements/files', 'post', body, metadata);
  }

  /**
   * Allows a user to set a job category for a given job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Category
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<412, types.Error> The request could not be completed due to the failure of a required precondition.
   * @throws FetchError<429, types.UpdateJobCategoryResponse429> Too Many Requests
   */
  updateJobCategory(body: types.JobCategoryBodyPut, metadata: types.UpdateJobCategoryMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/job-categories', 'put', body, metadata);
  }

  /**
   * Updates the lead source for a specified job. The endpoint validates that both job and
   * lead source belong to the company associated with the API key. If the provided lead
   * source ID matches the current one, no update will be performed. Empty GUIDs are not
   * allowed.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Lead Source
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.UpdateJobLeadSourceResponse429> Too Many Requests
   */
  updateJobLeadSource(body: types.JobLeadSource, metadata: types.UpdateJobLeadSourceMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/lead-source', 'put', body, metadata);
  }

  /**
   * Updates work type for a specific job.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Work Type
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.UpdateJobWorkTypeResponse429> Too Many Requests
   */
  updateJobWorkType(body: types.JobWorkType, metadata: types.UpdateJobWorkTypeMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/work-type', 'put', body, metadata);
  }

  /**
   * Use this endpoint to get a history of actions performed for a lead.
   *
   * **Supported includes:** `createdBy`.
   *
   *
   * @summary Get Lead History
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getLeadHistory(metadata: types.GetLeadHistoryMetadataParam): Promise<FetchResponse<200, types.LeadActionCollection>> {
    return this.core.fetch('/leads/{leadId}/history', 'get', metadata);
  }

  /**
   * Updates trade types for a specific job. Trade types passed on the body will replace
   * those already existing on the job. If an empty array is provided, current trade types in
   * the job will be unassigned.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Update Job Trade Types
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<403, types.Error> Not enough permissions.
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.UpdateJobTradeTypesResponse429> Too Many Requests
   */
  updateJobTradeTypes(body: types.JobTradeTypeCollection, metadata: types.UpdateJobTradeTypesMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch('/jobs/{jobId}/trade-types', 'put', body, metadata);
  }

  /**
   * Use this endpoint to get the list of users for a company. The status filter can be used
   * to filter users based on status - active, inactive, archived, or deleted.  By default,
   * only active users will be returned. This endpoint will return a paginated response
   * starting from the given record index.
   *
   *
   * @summary Get Users
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getUsers(metadata?: types.GetUsersMetadataParam): Promise<FetchResponse<200, types.CompanyUserCollection>> {
    return this.core.fetch('/users', 'get', metadata);
  }

  /**
   * Use this endpoint to get the details of a specific user.
   *
   *
   * @summary Get User
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getUser(metadata: types.GetUserMetadataParam): Promise<FetchResponse<200, types.CompanyUser>> {
    return this.core.fetch('/users/{userId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of instances for a scheduled report by it's unique
   * identifier. If the scheduled report requested is not available the response will be a
   * Not Found error. If the scheduled report requested hasn'run yet the response will be an
   * Empty response.
   *
   *
   * @summary Get Report Schedule Runs
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getReportsByInstanceInstanceRunsByScheduleId(metadata: types.GetReportsByInstanceInstanceRunsByScheduleIdMetadataParam): Promise<FetchResponse<200, types.ReportInstanceCollection>> {
    return this.core.fetch('/reports/scheduled-reports/{scheduledReportId}/runs', 'get', metadata);
  }

  /**
   * Use this endpoint to get a scheduled report instance by it's instance run unique
   * identifier. If the scheduled report requested is not available the response will be a
   * not found error. If the instance of the scheduled report doesn't exists, the response
   * will be a Not Found error
   *
   *
   * @summary Get Report Instance by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getReportByInstanceId(metadata: types.GetReportByInstanceIdMetadataParam): Promise<FetchResponse<200, types.ReportInstance>> {
    return this.core.fetch('/reports/scheduled-reports/{scheduledReportId}/runs/{instanceRunId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a scheduled report latest instance. If the scheduled report
   * requested is not available the response will be a Not Found error. If the scheduled
   * report requested hasn't run yet, the response will be an Empty response.
   *
   *
   * @summary Get Latest Report Instance
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getReportLatestInstance(metadata: types.GetReportLatestInstanceMetadataParam): Promise<FetchResponse<200, types.ReportInstance>> {
    return this.core.fetch('/reports/scheduled-reports/{scheduledReportId}/runs/latest', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of recipients for a specific instance of a given
   * scheduled report by it's unique identifier. If the scheduled report requested is not
   * available the response will be a Not Found error. The instance of the report should be a
   * valid instance of the scheduled report. If the scheduled report doesn't have any
   * recipient the response will be an Empty response.
   *
   *
   * @summary Get Report Instance Recipients
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getReportsRecipientsByInstanceId(metadata: types.GetReportsRecipientsByInstanceIdMetadataParam): Promise<FetchResponse<200, types.ReportInstanceRecipientCollection>> {
    return this.core.fetch('/reports/scheduled-reports/{scheduledReportId}/runs/{instanceRunId}/recipients', 'get', metadata);
  }

  /**
   * Use this endpoint to get a scheduled report recipient data of a given instance by it's
   * recipient unique identifier. If the scheduled report requested is not available the
   * response will be a not found error. If the instance of the scheduled report doesn't
   * exists, the response will be a Not Found error If the recipient of the scheduled report
   * doesn't exists, the response will be a Not Found error
   *
   *
   * @summary Get Report Instance Recipient by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getReportInstaceRecipientById(metadata: types.GetReportInstaceRecipientByIdMetadataParam): Promise<FetchResponse<200, types.ReportInstanceRecipient>> {
    return this.core.fetch('/reports/scheduled-reports/{scheduledReportId}/runs/{instanceRunId}/recipients/{recipientId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of supplements for the current location. StartIndex
   * starts at 0. Default PageSize is 25. Pagination parameters are optional. **Supported
   * includes:** `items`, `notations`.
   * **Example:**
   * `api/v2/supplements?pageSize=25&pageStartIndex=0&includes=items,notations&jobId=e591bf22-9828-4144-bca8-42cbb8c6e2c0`
   *
   *
   * @summary Get Supplements
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getFinancialsSupplementsForCompany(metadata?: types.GetFinancialsSupplementsForCompanyMetadataParam): Promise<FetchResponse<200, types.SupplementCollection>> {
    return this.core.fetch('/supplements', 'get', metadata);
  }

  /**
   * Use this endpoint to get a particular supplement for the current location.
   *
   *
   * @summary Get Supplement by ID
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> The range of data requested from the resource is invalid
   */
  getSupplementById(metadata: types.GetSupplementByIdMetadataParam): Promise<FetchResponse<200, types.Supplement>> {
    return this.core.fetch('/supplements/{supplementId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of items for a specific supplement in the current
   * location. StartIndex starts at 0. The default PageSize is 25. Pagination parameters are
   * optional.
   * **Example:** `api/v2/supplements/{supplementId}/items?pageSize=25&pageStartIndex=0`
   *
   *
   * @summary Get Supplement Items
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getFinancialsSupplementItemCollection(metadata: types.GetFinancialsSupplementItemCollectionMetadataParam): Promise<FetchResponse<200, types.SupplementItemCollection>> {
    return this.core.fetch('/supplements/{supplementId}/items', 'get', metadata);
  }

  /**
   * Use this endpoint to get a list of notations for a specific supplement in the current
   * location. StartIndex starts at 0. The default PageSize is 25. Pagination parameters are
   * optional.
   * **Example:** `api/v2/supplements/{supplementId}/notations?pageSize=25&pageStartIndex=0`
   *
   *
   * @summary Get Supplement Notations
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getFinancialsSupplementNotationCollection(metadata: types.GetFinancialsSupplementNotationCollectionMetadataParam): Promise<FetchResponse<200, types.SupplementNotationCollection>> {
    return this.core.fetch('/supplements/{supplementId}/notations', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific Invoice.
   *
   *
   * @summary Get Invoice
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getInvoiceById(metadata: types.GetInvoiceByIdMetadataParam): Promise<FetchResponse<200, types.Invoice>> {
    return this.core.fetch('/invoices/{invoiceId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get the Financials for the specified financialID. **Supported
   * includes:** `worksheet`, `amendments`.
   *
   *
   * @summary Get Financials
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getFinancialsByFinancialId(metadata: types.GetFinancialsByFinancialIdMetadataParam): Promise<FetchResponse<200, types.Financials>> {
    return this.core.fetch('/financials/{financialsId}', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific Worksheet by financial ID.
   *
   *
   * @summary Get Worksheet
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getWorksheetById(metadata: types.GetWorksheetByIdMetadataParam): Promise<FetchResponse<200, types.Worksheet>> {
    return this.core.fetch('/financials/{financialsId}/worksheet', 'get', metadata);
  }

  /**
   * Creates a new item in a worksheet using its financial ID. If the worksheet does not
   * exist, it will be created, and the sectionId parameter should be left empty. If the
   * worksheet already exists, you must provide the sectionId parameter, which should be a
   * valid section ID within the worksheet.
   *
   * This endpoint is rate limited. Use the `RateLimit-*` response headers to check current
   * limits and remaining quota.
   *
   *
   * @summary Create Worksheet Item
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<429, types.PostWorksheetSectionItemResponse429> Too Many Requests
   */
  postWorksheetSectionItem(body: types.WorksheetItemPost, metadata: types.PostWorksheetSectionItemMetadataParam): Promise<FetchResponse<201, types.IdPost>> {
    return this.core.fetch('/financials/{financialsId}/worksheet/items', 'post', body, metadata);
  }

  /**
   * Use this endpoint to get a specific Financial's Amendments.
   *
   *
   * @summary Get Financial Amendments
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   * @throws FetchError<416, types.Error> The range of data requested from the resource is invalid
   */
  getWorksheetAmendmentsById(metadata: types.GetWorksheetAmendmentsByIdMetadataParam): Promise<FetchResponse<200, types.WorksheetAmendmentCollection>> {
    return this.core.fetch('/financials/{financialsId}/amendments', 'get', metadata);
  }

  /**
   * Use this endpoint to get a specific Amendment.
   *
   *
   * @summary Get Financial Amendment
   * @throws FetchError<400, types.Error> Bad Request
   * @throws FetchError<401, types.Error> API Key is invalid or deactivated
   * @throws FetchError<404, types.Error> Requested resource does not exist.
   */
  getWorksheetAmendmentById(metadata: types.GetWorksheetAmendmentByIdMetadataParam): Promise<FetchResponse<200, types.WorksheetAmendment>> {
    return this.core.fetch('/financials/{financialsId}/amendments/{financialsAmendmentId}', 'get', metadata);
  }
}
