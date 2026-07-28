import { defineTool } from "../lib/define-tool.ts";
import { z } from "zod";
import { ResponseFormat } from "../lib/constants.ts";
import { getAccuLynxClient, handleApiError, formatToolResponse } from "../lib/acculynx.ts";

/**
 * The AccuLynx API has no native "assigned user" filter on /jobs or /jobs/search,
 * and the jobs listing cannot inline representatives. This tool encapsulates the
 * required fan-out: list jobs, then look up each job's representatives and keep the
 * ones where the target user is assigned. The scan is bounded by maxJobsToScan.
 */

const REP_CONCURRENCY = 5;
const MAX_API_PAGE_SIZE = 25;
const PAGE_SIZE = MAX_API_PAGE_SIZE;
const MAX_SCAN_CAP = 250;

export default defineTool({
  description:
    "Find jobs/leads assigned to a specific user (by userId or name). AccuLynx has no direct assigned-user filter, so this scans the most recent jobs and matches each job's representatives/owners against the user. Use this instead of manually chaining acculynx_get_jobs + acculynx_get_job_representatives.",
  inputSchema: z.object({
    userId: z.string().guid().optional().describe("UUID of the assigned user (preferred; from acculynx_get_users). Provide this OR userName."),
    userName: z.string().optional().describe("Full or partial user name to resolve to a user. Used only if userId is not provided."),
    role: z.enum(["CompanyRepresentative", "SalesOwner", "AROwner", "Additional"]).optional().describe("Only match this assignment role (e.g. SalesOwner). Omit to match any role."),
    milestones: z.string().optional().describe("Comma-separated milestone names to limit the scan (e.g. 'Lead'). Discover names via acculynx_get_milestones."),
    assignment: z.enum(["assigned", "unassigned"]).optional().describe("Job assignment filter. Defaults to 'assigned' since unassigned jobs have no representatives."),
    sortBy: z.enum(["CreatedDate", "MilestoneDate", "ModifiedDate"]).optional().describe("Date field to sort the scan by (default CreatedDate)"),
    sortOrder: z.enum(["Ascending", "Descending"]).optional().describe("Scan order (default Descending = newest first)"),
    maxJobsToScan: z.number().int().positive().optional().describe(`Maximum number of jobs to scan (default 100, hard cap ${MAX_SCAN_CAP}). Each scanned job costs one extra API call.`),
    response_format: z.nativeEnum(ResponseFormat).optional().describe("Output serialization format"),
  }),
  async execute({ userId, userName, role, milestones, assignment, sortBy, sortOrder, maxJobsToScan, response_format }, ctx) {
    try {
      if (!userId && !userName) {
        return formatToolResponse({ error: "Provide either userId or userName to identify the assigned user." }, response_format);
      }
      const client = getAccuLynxClient();

      // 1. Resolve the target user (and a friendly display name) from the users directory.
      const usersRes = await client.getUsers({ pageSize: MAX_API_PAGE_SIZE });
      const users: any[] = (usersRes.data as any)?.items || [];
      const nameOf = (u: any) => u?.displayName || [u?.firstName, u?.lastName].filter(Boolean).join(" ") || u?.email || u?.id;

      let targetUser: any | undefined;
      if (userId) {
        targetUser = users.find((u) => u?.id === userId) || { id: userId };
      } else {
        const q = (userName as string).trim().toLowerCase();
        const candidates = users.filter((u) => nameOf(u).toLowerCase().includes(q));
        if (candidates.length === 0) {
          return formatToolResponse({ error: `No user found matching "${userName}".`, hint: "Call acculynx_get_users to see available users." }, response_format);
        }
        if (candidates.length > 1) {
          return formatToolResponse({
            error: `Multiple users match "${userName}". Re-run with a specific userId.`,
            candidates: candidates.map((u) => ({ id: u.id, name: nameOf(u), email: u?.email })),
          }, response_format);
        }
        targetUser = candidates[0];
      }
      const targetId: string = targetUser.id;

      // 2. Page through jobs up to the scan cap.
      const scanCap = Math.min(maxJobsToScan ?? 100, MAX_SCAN_CAP);
      const scannedJobs: any[] = [];
      let totalAvailable: number | undefined;
      let recordStartIndex = 0;
      while (scannedJobs.length < scanCap) {
        const metadata: any = { includes: "contacts", pageSize: PAGE_SIZE, recordStartIndex };
        metadata.assignment = assignment ?? "assigned";
        if (milestones) metadata.milestones = milestones;
        metadata.sortBy = sortBy ?? "CreatedDate";
        metadata.sortOrder = sortOrder ?? "Descending";
        const jobsRes = await client.getJobs(metadata);
        const data: any = jobsRes.data || {};
        if (totalAvailable === undefined) totalAvailable = data.count;
        const items: any[] = data.items || [];
        if (items.length === 0) break;
        scannedJobs.push(...items);
        recordStartIndex += items.length;
        if (typeof data.count === "number" && recordStartIndex >= data.count) break;
      }
      const toScan = scannedJobs.slice(0, scanCap);

      // 3. Fan out representative lookups in bounded-concurrency batches and match.
      const matches: any[] = [];
      let lookupErrors = 0;
      for (let i = 0; i < toScan.length; i += REP_CONCURRENCY) {
        const batch = toScan.slice(i, i + REP_CONCURRENCY);
        await Promise.all(
          batch.map(async (job) => {
            try {
              const repRes = await client.getRepresentativesForJob({ jobId: job.id, pageSize: MAX_API_PAGE_SIZE });
              const reps: any[] = (repRes.data as any)?.items || [];
              const matchedRoles = reps
                .filter((r) => r?.user?.id === targetId && (!role || r?.type === role))
                .map((r) => r.type);
              if (matchedRoles.length > 0) {
                matches.push({
                  id: job.id,
                  jobNumber: job.jobNumber,
                  jobName: job.jobName,
                  currentMilestone: job.currentMilestone,
                  assignedRoles: matchedRoles,
                  createdDate: job.createdDate,
                  modifiedDate: job.modifiedDate,
                  contacts: job.contacts,
                });
              }
            } catch {
              lookupErrors += 1;
            }
          }),
        );
      }

      const truncatedScan = typeof totalAvailable === "number" && totalAvailable > toScan.length;
      return formatToolResponse({
        assignedUser: { id: targetId, name: nameOf(targetUser) },
        roleFilter: role ?? "any",
        milestoneFilter: milestones ?? null,
        jobsScanned: toScan.length,
        totalJobsAvailable: totalAvailable ?? toScan.length,
        truncatedScan,
        scanNote: truncatedScan
          ? `Only the first ${toScan.length} of ${totalAvailable} jobs were scanned (maxJobsToScan). Increase maxJobsToScan or narrow with milestones to cover more.`
          : undefined,
        lookupErrors,
        matchedCount: matches.length,
        matches,
      }, response_format);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
  toModelOutput(output) {
    return { type: "text", value: output.text };
  },
});
