import api from './axiosConfig';
import { getCurrentUserId } from '../components/ui/CurrentUserSwitcher';

function buildPayload(extra = {}) {
    const actorUserId = getCurrentUserId();
    if (actorUserId == null) {
        const err = new Error('Aktīvais lietotājs nav izvēlēts.');
        err.code = 'NO_ACTOR';
        throw err;
    }
    return { actorUserId, ...extra };
}

export async function submitVersion(versionId, comment) {
    const res = await api.post(`/course-versions/${versionId}/submit`, buildPayload({ comment }));
    return res.data;
}

export async function approveVersion(versionId, { decisionNumber, approvalDate, decisionReference, comment } = {}) {
    const res = await api.post(`/course-versions/${versionId}/approve`, buildPayload({
        decisionNumber,
        approvalDate: approvalDate || null,
        decisionReference: decisionReference || null,
        comment: comment || null,
    }));
    return res.data;
}

export async function rejectVersion(versionId, comment) {
    const res = await api.post(`/course-versions/${versionId}/reject`, buildPayload({ comment }));
    return res.data;
}

export async function reopenVersion(versionId, comment) {
    const res = await api.post(`/course-versions/${versionId}/reopen`, buildPayload({ comment }));
    return res.data;
}
