// SharePoint Configuration
// These are the actual SharePoint lists from the PowerApps canvas app

export const SHAREPOINT_SITE_ID = 'pwc.sharepoint.com,usadvisorye3969a11f23b4217823ddbbee9787212'
export const SHAREPOINT_SITE_URL = 'https://pwc.sharepoint.com/teams/usadvisorye3969a11f23b4217823ddbbee9787212'

// SharePoint List IDs (GUIDs from the PowerApps app)
export const SHAREPOINT_LISTS = {
  Staff: '5daab483-f09f-4044-9f9d-cbc92f2c9a60',
  Deliverables: '86b83898-4cd2-4035-ade5-e46289344fc1',
  Workstreams: '03733675-ab5e-4aaf-b426-3698184e6b21',
  WeeklyHours: 'ec7383a9-8bbf-438a-8698-67f6dd6cc17b',
  TimeOffRequests: '471c01a0-5ddb-4cdb-9012-f70a413341af',
  AuditTrail: 'de979cf7-4440-47ab-97ea-a99e1ab60080',
  AppUsageLog: 'f62b87a5-dbbb-4005-9095-cd27be68a170',
} as const

// Microsoft Graph API scopes needed for SharePoint access
export const sharepointScopes = [
  'Sites.Read.All',
  'Sites.ReadWrite.All',
]
