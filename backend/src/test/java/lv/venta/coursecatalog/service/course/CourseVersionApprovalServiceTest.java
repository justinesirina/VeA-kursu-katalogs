package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.log.CourseVersionAction;
import lv.venta.coursecatalog.model.log.CourseVersionLog;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.log.CourseVersionActionRepository;
import lv.venta.coursecatalog.repository.log.CourseVersionLogRepository;
import lv.venta.coursecatalog.repository.support.VersionStatusRepository;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseVersionApprovalServiceTest {

    @Mock CourseVersionRepository versionRepo;
    @Mock VersionStatusRepository statusRepo;
    @Mock UserRepository userRepo;
    @Mock CourseVersionActionRepository actionRepo;
    @Mock CourseVersionLogRepository logRepo;

    @InjectMocks CourseVersionApprovalService service;

    private Course course;
    private User actor;

    @BeforeEach
    void setUp() {
        course = new Course();
        course.setId(UUID.randomUUID());

        actor = new User();
        actor.setId(7);
        actor.setName("Anna");
        actor.setSurname("Bērziņa");
    }

    // ----- helpers -----

    private VersionStatus status(int id, String name) {
        VersionStatus s = new VersionStatus();
        s.setId(id);
        s.setName(name);
        return s;
    }

    private CourseVersionAction action(int id, String code) {
        CourseVersionAction a = new CourseVersionAction();
        a.setId(id);
        a.setCode(code);
        return a;
    }

    private CourseVersion version(VersionStatus initial) {
        CourseVersion v = new CourseVersion();
        v.setId(UUID.randomUUID());
        v.setCourse(course);
        v.setStatus(initial);
        v.setVersionNumber(1);
        return v;
    }

    private void mockUserAndStatus(String targetStatusName) {
        when(userRepo.findById(actor.getId())).thenReturn(Optional.of(actor));
        when(statusRepo.findByName(targetStatusName))
                .thenReturn(Optional.of(status(99, targetStatusName)));
    }

    private void mockSavePassThrough() {
        when(versionRepo.save(any(CourseVersion.class)))
                .thenAnswer(inv -> inv.getArgument(0));
    }

    // ----- submit -----

    @Test
    void submit_fromDraft_setsStatusAndLogs() {
        CourseVersion v = version(status(1, "Melnraksts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));
        mockUserAndStatus("Iesniegts");
        mockSavePassThrough();
        when(actionRepo.findByCode("submit")).thenReturn(Optional.of(action(10, "submit")));

        CourseVersion result = service.submit(v.getId(), actor.getId(), null);

        assertEquals("Iesniegts", result.getStatus().getName());
        assertEquals(actor, result.getUpdatedBy());
        assertNotNull(result.getUpdatedAt());

        ArgumentCaptor<CourseVersionLog> logCap = ArgumentCaptor.forClass(CourseVersionLog.class);
        verify(logRepo).save(logCap.capture());
        assertEquals("submit", logCap.getValue().getAction().getCode());
        assertEquals(actor, logCap.getValue().getUser());
    }

    @Test
    void submit_fromIesniegts_throws() {
        CourseVersion v = version(status(2, "Iesniegts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.submit(v.getId(), actor.getId(), null));
        assertTrue(ex.getMessage().contains("Melnraksts"));
        verify(logRepo, never()).save(any());
    }

    // ----- approve -----

    @Test
    void approve_fromIesniegts_deactivatesPriorActiveAndLogs() {
        CourseVersion subject = version(status(2, "Iesniegts"));
        CourseVersion priorActive = version(status(3, "Apstiprināts"));
        priorActive.setActive(true);

        when(versionRepo.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(versionRepo.findByCourseIdAndIsActiveTrueAndDeletedAtIsNull(course.getId()))
                .thenReturn(List.of(priorActive));
        mockUserAndStatus("Apstiprināts");
        mockSavePassThrough();
        when(actionRepo.findByCode("approve")).thenReturn(Optional.of(action(11, "approve")));

        LocalDate date = LocalDate.of(2026, 5, 3);
        CourseVersion result = service.approve(subject.getId(), actor.getId(),
                "Nr. ITF-2026/05", date, "Senāts", "labi izstrādāts");

        assertEquals("Apstiprināts", result.getStatus().getName());
        assertTrue(result.isActive());
        assertEquals(date, result.getApprovalDate());
        assertEquals("Nr. ITF-2026/05", result.getDecisionNumber());
        assertEquals("Senāts", result.getDecisionReference());
        assertFalse(priorActive.isActive(), "Iepriekšējā aktīvā versija jādeaktivē");

        ArgumentCaptor<CourseVersionLog> logCap = ArgumentCaptor.forClass(CourseVersionLog.class);
        verify(logRepo).save(logCap.capture());
        assertEquals("approve", logCap.getValue().getAction().getCode());
        assertTrue(logCap.getValue().getComment().contains("Nr. ITF-2026/05"));
    }

    @Test
    void approve_defaultsApprovalDateToToday_whenNullSupplied() {
        CourseVersion subject = version(status(2, "Iesniegts"));

        when(versionRepo.findById(subject.getId())).thenReturn(Optional.of(subject));
        when(versionRepo.findByCourseIdAndIsActiveTrueAndDeletedAtIsNull(course.getId()))
                .thenReturn(List.of());
        mockUserAndStatus("Apstiprināts");
        mockSavePassThrough();
        when(actionRepo.findByCode("approve")).thenReturn(Optional.of(action(11, "approve")));

        CourseVersion result = service.approve(subject.getId(), actor.getId(),
                "Nr. ITF-2026/05", null, null, null);

        assertEquals(LocalDate.now(), result.getApprovalDate());
    }

    @Test
    void approve_blankDecisionNumber_throws() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> service.approve(UUID.randomUUID(), actor.getId(), "  ", null, null, null));
        assertTrue(ex.getMessage().contains("decisionNumber"));
        verify(versionRepo, never()).findById(any());
    }

    @Test
    void approve_fromMelnraksts_throws() {
        CourseVersion v = version(status(1, "Melnraksts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));

        assertThrows(IllegalStateException.class, () ->
                service.approve(v.getId(), actor.getId(), "Nr. 1", null, null, null));
        verify(logRepo, never()).save(any());
    }

    // ----- reject -----

    @Test
    void reject_fromIesniegts_logsReason() {
        CourseVersion v = version(status(2, "Iesniegts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));
        mockUserAndStatus("Noraidīts");
        mockSavePassThrough();
        when(actionRepo.findByCode("reject")).thenReturn(Optional.of(action(12, "reject")));

        CourseVersion result = service.reject(v.getId(), actor.getId(), "Trūkst SKR sasaiste");

        assertEquals("Noraidīts", result.getStatus().getName());

        ArgumentCaptor<CourseVersionLog> logCap = ArgumentCaptor.forClass(CourseVersionLog.class);
        verify(logRepo).save(logCap.capture());
        assertEquals("Trūkst SKR sasaiste", logCap.getValue().getComment());
    }

    @Test
    void reject_blankComment_throws() {
        assertThrows(IllegalArgumentException.class,
                () -> service.reject(UUID.randomUUID(), actor.getId(), ""));
    }

    @Test
    void reject_fromDraft_throws() {
        CourseVersion v = version(status(1, "Melnraksts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));

        assertThrows(IllegalStateException.class,
                () -> service.reject(v.getId(), actor.getId(), "iemesls"));
    }

    // ----- reopen -----

    @Test
    void reopen_fromRejected_returnsToDraft() {
        CourseVersion v = version(status(4, "Noraidīts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));
        mockUserAndStatus("Melnraksts");
        mockSavePassThrough();
        when(actionRepo.findByCode("reopen_to_draft")).thenReturn(Optional.of(action(13, "reopen_to_draft")));

        CourseVersion result = service.reopenToDraft(v.getId(), actor.getId(), null);

        assertEquals("Melnraksts", result.getStatus().getName());
        verify(logRepo).save(any());
    }

    @Test
    void reopen_fromApproved_throws() {
        CourseVersion v = version(status(3, "Apstiprināts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));

        assertThrows(IllegalStateException.class,
                () -> service.reopenToDraft(v.getId(), actor.getId(), null));
    }

    // ----- missing actor -----

    @Test
    void submit_unknownUser_throws() {
        CourseVersion v = version(status(1, "Melnraksts"));
        when(versionRepo.findById(v.getId())).thenReturn(Optional.of(v));
        when(userRepo.findById(actor.getId())).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> service.submit(v.getId(), actor.getId(), null));
    }
}
