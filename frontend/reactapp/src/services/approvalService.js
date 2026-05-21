import api from './axiosConfig';

// F8 plūsmas pieprasījumi — aktīvo lietotāju backend iegūst no sesijas.

export async function submitVersion(versionId, comment) {
    const res = await api.post(`/course-versions/${versionId}/submit`, { comment });
    return res.data;
}

export async function approveVersion(versionId, { decisionNumber, approvalDate, decisionReference, comment } = {}) {
    const res = await api.post(`/course-versions/${versionId}/approve`, {
        decisionNumber,
        approvalDate: approvalDate || null,
        decisionReference: decisionReference || null,
        comment: comment || null,
    });
    return res.data;
}

export async function rejectVersion(versionId, comment) {
    const res = await api.post(`/course-versions/${versionId}/reject`, { comment });
    return res.data;
}

export async function reopenVersion(versionId, comment) {
    const res = await api.post(`/course-versions/${versionId}/reopen`, { comment });
    return res.data;
}
