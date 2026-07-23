import api from '../api';

/**
 * Service for admin job application management.
 * Provides methods to fetch all applications, update status, and delete an application.
 *
 * Backend routes are under /api/v1/job-applications (no /admin prefix).
 */
export const jobApplicationService = {
  /** Fetch all job applications */
  getApplications: async () => {
    return api.get('/job-applications');
  },

  /** Update the status of a specific application */
  updateApplicationStatus: async (
    id: string,
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  ) => {
    return api.put(`/job-applications/${id}/status`, { status });
  },

  /** Delete a job application */
  deleteApplication: async (id: string) => {
    return api.delete(`/job-applications/${id}`);
  },
};

export default jobApplicationService;
