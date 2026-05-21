package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.support.VersionStatusRepository;
import lv.venta.coursecatalog.repository.user.UserRepository;
import lv.venta.coursecatalog.service.log.CourseVersionLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * F8 — Servisa klase, kas vada kursa versijas apstiprināšanas plūsmu:
 * Melnraksts → Iesniegts → Apstiprināts | Noraidīts.
 *
 * Statusu nosaukumi un darbību kodi atbilst DB seedētajām vērtībām
 * (VersionStatus + CourseVersionAction). Katra pāreja veic precondition
 * pārbaudi, atjauno versijas laukus un automātiski ieraksta CourseVersionLog
 * ierakstu — manuālā pieeja, kas nodrošina skaidru audita pēdas plūsmu.
 */
@Service
public class CourseVersionApprovalService {

    static final String STATUS_DRAFT = "Melnraksts";
    static final String STATUS_SUBMITTED = "Iesniegts";
    static final String STATUS_APPROVED = "Apstiprināts";
    static final String STATUS_REJECTED = "Noraidīts";

    static final String ACTION_SUBMIT = "submit";
    static final String ACTION_APPROVE = "approve";
    static final String ACTION_REJECT = "reject";
    static final String ACTION_REOPEN = "reopen_to_draft";

    private final CourseVersionRepository versionRepo;
    private final VersionStatusRepository statusRepo;
    private final UserRepository userRepo;
    private final CourseVersionLogService logService;

    public CourseVersionApprovalService(CourseVersionRepository versionRepo,
                                        VersionStatusRepository statusRepo,
                                        UserRepository userRepo,
                                        CourseVersionLogService logService) {
        this.versionRepo = versionRepo;
        this.statusRepo = statusRepo;
        this.userRepo = userRepo;
        this.logService = logService;
    }

    @Transactional
    public CourseVersion submit(UUID versionId, Integer actorUserId, String comment) {
        CourseVersion v = loadVersion(versionId);
        requireStatus(v, STATUS_DRAFT);

        User actor = loadUser(actorUserId);
        v.setStatus(loadStatus(STATUS_SUBMITTED));
        v.setUpdatedBy(actor);
        v.setUpdatedAt(LocalDateTime.now());
        CourseVersion saved = versionRepo.save(v);

        appendLog(saved, actor, ACTION_SUBMIT, comment);
        return saved;
    }

    @Transactional
    public CourseVersion approve(UUID versionId,
                                 Integer actorUserId,
                                 String decisionNumber,
                                 LocalDate approvalDate,
                                 String decisionReference,
                                 String comment) {
        if (decisionNumber == null || decisionNumber.isBlank()) {
            throw new IllegalArgumentException("Lēmuma numurs (decisionNumber) ir obligāts.");
        }

        CourseVersion v = loadVersion(versionId);
        requireStatus(v, STATUS_SUBMITTED);

        User actor = loadUser(actorUserId);

        // Deaktivē iepriekšējās aktīvās versijas (paliek statusā Apstiprināts kā vēsturiskas).
        UUID courseId = v.getCourse().getId();
        List<CourseVersion> currentlyActive =
                versionRepo.findByCourseIdAndIsActiveTrueAndDeletedAtIsNull(courseId);
        for (CourseVersion prior : currentlyActive) {
            if (!prior.getId().equals(v.getId())) {
                prior.setActive(false);
                prior.setUpdatedBy(actor);
                prior.setUpdatedAt(LocalDateTime.now());
                versionRepo.save(prior);
            }
        }

        v.setStatus(loadStatus(STATUS_APPROVED));
        v.setActive(true);
        v.setApprovalDate(approvalDate != null ? approvalDate : LocalDate.now());
        v.setDecisionNumber(decisionNumber.trim());
        if (decisionReference != null) {
            v.setDecisionReference(decisionReference.trim().isEmpty() ? null : decisionReference.trim());
        }
        v.setUpdatedBy(actor);
        v.setUpdatedAt(LocalDateTime.now());
        CourseVersion saved = versionRepo.save(v);

        String logComment = "Lēmums: " + saved.getDecisionNumber()
                + (comment != null && !comment.isBlank() ? " — " + comment.trim() : "");
        appendLog(saved, actor, ACTION_APPROVE, logComment);
        return saved;
    }

    @Transactional
    public CourseVersion reject(UUID versionId, Integer actorUserId, String comment) {
        if (comment == null || comment.isBlank()) {
            throw new IllegalArgumentException("Noraidījuma iemesls (comment) ir obligāts.");
        }

        CourseVersion v = loadVersion(versionId);
        requireStatus(v, STATUS_SUBMITTED);

        User actor = loadUser(actorUserId);
        v.setStatus(loadStatus(STATUS_REJECTED));
        v.setUpdatedBy(actor);
        v.setUpdatedAt(LocalDateTime.now());
        CourseVersion saved = versionRepo.save(v);

        appendLog(saved, actor, ACTION_REJECT, comment.trim());
        return saved;
    }

    @Transactional
    public CourseVersion reopenToDraft(UUID versionId, Integer actorUserId, String comment) {
        CourseVersion v = loadVersion(versionId);
        // F8: atļauts no Noraidīts (autora labošanas plūsma) un no Iesniegts
        // Pasniedzēja atsaukums vai Programmas direktora "Atvērt labošanai" pirms lēmuma.
        requireStatusOneOf(v, STATUS_SUBMITTED, STATUS_REJECTED);

        User actor = loadUser(actorUserId);
        v.setStatus(loadStatus(STATUS_DRAFT));
        v.setUpdatedBy(actor);
        v.setUpdatedAt(LocalDateTime.now());
        CourseVersion saved = versionRepo.save(v);

        appendLog(saved, actor, ACTION_REOPEN, comment);
        return saved;
    }

    private CourseVersion loadVersion(UUID id) {
        return versionRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Versija ar ID " + id + " nav atrasta."));
    }

    private User loadUser(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Aktīvais lietotājs (actorUserId) ir obligāts.");
        }
        return userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lietotājs ar ID " + id + " nav atrasts."));
    }

    private VersionStatus loadStatus(String name) {
        return statusRepo.findByName(name)
                .orElseThrow(() -> new IllegalStateException("Statuss '" + name + "' nav atrasts datubāzē."));
    }

    private void requireStatus(CourseVersion v, String expected) {
        String actual = v.getStatus() != null ? v.getStatus().getName() : null;
        if (!expected.equals(actual)) {
            throw new IllegalStateException(
                    "Šo darbību nevar veikt versijai statusā '" + actual + "'. Nepieciešams statuss '" + expected + "'.");
        }
    }

    /**
     * Pārbauda, ka versija atrodas vienā no atļautajiem statusiem.
     * Izmanto F8 pārejām, kas pieņem vairākus avota statusus (piem., reopenToDraft
     * pieņem gan Iesniegts, gan Noraidīts).
     */
    private void requireStatusOneOf(CourseVersion v, String... allowed) {
        String actual = v.getStatus() != null ? v.getStatus().getName() : null;
        for (String s : allowed) {
            if (s.equals(actual)) return;
        }
        throw new IllegalStateException(
                "Šo darbību nevar veikt versijai statusā '" + actual + "'. Nepieciešams viens no statusiem: "
                        + String.join(", ", allowed) + ".");
    }

    private void appendLog(CourseVersion version, User user, String actionCode, String comment) {
        logService.append(version.getCourse(), version, user != null ? user.getId() : null, actionCode, comment);
    }
}
