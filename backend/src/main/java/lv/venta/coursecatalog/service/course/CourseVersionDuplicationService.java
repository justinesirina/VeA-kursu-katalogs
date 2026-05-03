package lv.venta.coursecatalog.service.course;

import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.courseinfo.*;
import lv.venta.coursecatalog.model.program.CourseToProgrammeResults;
import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.course.CourseTeacherRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.courseinfo.*;
import lv.venta.coursecatalog.repository.program.CourseToProgrammeResultsRepository;
import lv.venta.coursecatalog.repository.program.CourseToStudyProgramsRepository;
import lv.venta.coursecatalog.repository.support.VersionStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Servisa klase, kas dzili duplicē esošu CourseVersion ierakstu — izveido jaunu Melnraksts
 * versiju ar inkrementētu versionNumber un nokopē visu CourseInfo + tās bērnu saturu.
 *
 * SKR (CourseResult) un to vērtēšanas sasaiste (CourseResultAssessment) NAV jākopē, jo tās
 * ir piesaistītas Course (nevis CourseVersion) un tādēļ ir kopīgas visām versijām.
 */
@Service
public class CourseVersionDuplicationService {

    private static final String DRAFT_STATUS_NAME = "Melnraksts";

    private final CourseVersionRepository versionRepo;
    private final VersionStatusRepository versionStatusRepo;
    private final CourseInfoRepository courseInfoRepo;
    private final CoursePrerequisitesRepository prerequisitesRepo;
    private final CourseContentRepository courseContentRepo;
    private final CalendarTopicRepository calendarTopicRepo;
    private final CalendarSessionRepository calendarSessionRepo;
    private final CourseAssessmentDistributionRepository assessmentDistRepo;
    private final CourseSelfStudyDistributionRepository selfStudyDistRepo;
    private final LiteratureSourceRepository literatureRepo;
    private final CourseToProgrammeResultsRepository programmeLinkRepo;
    private final CourseAuthorRepository courseAuthorRepo;
    private final CourseTeacherRepository courseTeacherRepo;
    private final CourseToStudyProgramsRepository courseToStudyProgramsRepo;

    @Autowired
    public CourseVersionDuplicationService(
            CourseVersionRepository versionRepo,
            VersionStatusRepository versionStatusRepo,
            CourseInfoRepository courseInfoRepo,
            CoursePrerequisitesRepository prerequisitesRepo,
            CourseContentRepository courseContentRepo,
            CalendarTopicRepository calendarTopicRepo,
            CalendarSessionRepository calendarSessionRepo,
            CourseAssessmentDistributionRepository assessmentDistRepo,
            CourseSelfStudyDistributionRepository selfStudyDistRepo,
            LiteratureSourceRepository literatureRepo,
            CourseToProgrammeResultsRepository programmeLinkRepo,
            CourseAuthorRepository courseAuthorRepo,
            CourseTeacherRepository courseTeacherRepo,
            CourseToStudyProgramsRepository courseToStudyProgramsRepo) {
        this.versionRepo = versionRepo;
        this.versionStatusRepo = versionStatusRepo;
        this.courseInfoRepo = courseInfoRepo;
        this.prerequisitesRepo = prerequisitesRepo;
        this.courseContentRepo = courseContentRepo;
        this.calendarTopicRepo = calendarTopicRepo;
        this.calendarSessionRepo = calendarSessionRepo;
        this.assessmentDistRepo = assessmentDistRepo;
        this.selfStudyDistRepo = selfStudyDistRepo;
        this.literatureRepo = literatureRepo;
        this.programmeLinkRepo = programmeLinkRepo;
        this.courseAuthorRepo = courseAuthorRepo;
        this.courseTeacherRepo = courseTeacherRepo;
        this.courseToStudyProgramsRepo = courseToStudyProgramsRepo;
    }

    /**
     * Dzili nokopē kursa versiju. Jaunā versija manto akadēmisko gadu, semestri,
     * fakultāti un decisionReference no avota — lietotājs tos var koriģēt pēc vajadzības.
     * Tikai approvalDate un decisionNumber paliek tukši, jo tie atspoguļo konkrētu apstiprināšanas
     * lēmumu, ko jaunā versija vēl nav saņēmusi.
     *
     * @throws IllegalArgumentException ja sākotnējā versija nav atrasta
     * @throws IllegalStateException    ja sākotnējā versija ir arhivēta
     */
    @Transactional
    public CourseVersion duplicateVersion(UUID sourceVersionId) {
        CourseVersion source = versionRepo.findById(sourceVersionId)
                .orElseThrow(() -> new IllegalArgumentException("Versija ar ID " + sourceVersionId + " nav atrasta."));

        if (source.getDeletedAt() != null) {
            throw new IllegalStateException("Arhivētu versiju nevar duplicēt.");
        }

        VersionStatus draftStatus = versionStatusRepo.findByName(DRAFT_STATUS_NAME)
                .orElseThrow(() -> new IllegalStateException(
                        "Statuss '" + DRAFT_STATUS_NAME + "' nav atrasts datubāzē."));

        Integer maxNumber = versionRepo.findMaxVersionNumberByCourseId(source.getCourse().getId());
        int nextNumber = (maxNumber == null ? 0 : maxNumber) + 1;

        CourseVersion target = new CourseVersion();
        target.setCourse(source.getCourse());
        target.setFaculty(source.getFaculty());
        target.setVersionNumber(nextNumber);
        target.setStatus(draftStatus);
        target.setAcademicYear(source.getAcademicYear());
        target.setSemester(source.getSemester());
        target.setDecisionReference(source.getDecisionReference());
        target.setApprovalDate(null);
        target.setDecisionNumber(null);
        target.setActive(false);
        target.setArchived(false);
        target.setCreatedBy(source.getUpdatedBy() != null ? source.getUpdatedBy() : source.getCreatedBy());
        target.setUpdatedBy(null);
        target = versionRepo.save(target);

        cloneAuthors(source, target);
        cloneTeachers(source, target);
        cloneStudyProgramLinks(source, target);

        CourseInfo sourceInfo = courseInfoRepo.findByCourseAndCourseVersion(source.getCourse(), source)
                .orElse(null);
        if (sourceInfo != null) {
            CourseInfo targetInfo = cloneCourseInfo(sourceInfo, target);
            targetInfo = courseInfoRepo.save(targetInfo);

            cloneChildren(sourceInfo, targetInfo);
        }

        return target;
    }

    private void cloneAuthors(CourseVersion src, CourseVersion dst) {
        for (CourseAuthor a : courseAuthorRepo.findByCourseVersionId(src.getId())) {
            CourseAuthor copy = new CourseAuthor();
            copy.setCourseVersion(dst);
            copy.setUser(a.getUser());
            copy.setRole(a.getRole());
            courseAuthorRepo.save(copy);
        }
    }

    private void cloneTeachers(CourseVersion src, CourseVersion dst) {
        for (CourseTeacher t : courseTeacherRepo.findByCourseVersionId(src.getId())) {
            CourseTeacher copy = new CourseTeacher();
            copy.setCourseVersion(dst);
            copy.setUser(t.getUser());
            copy.setRole(t.getRole());
            courseTeacherRepo.save(copy);
        }
    }

    private void cloneStudyProgramLinks(CourseVersion src, CourseVersion dst) {
        for (CourseToStudyPrograms link : courseToStudyProgramsRepo.findByCourseVersionId(src.getId())) {
            CourseToStudyPrograms copy = new CourseToStudyPrograms();
            copy.setCourseVersion(dst);
            copy.setProgram(link.getProgram());
            copy.setProgramPart(link.getProgramPart());
            courseToStudyProgramsRepo.save(copy);
        }
    }

    private CourseInfo cloneCourseInfo(CourseInfo src, CourseVersion newVersion) {
        CourseInfo dst = new CourseInfo();
        dst.setCourse(src.getCourse());
        dst.setCourseVersion(newVersion);
        dst.setAcademicHoursTotal(src.getAcademicHoursTotal());
        dst.setLectureHours(src.getLectureHours());
        dst.setPractClassesHours(src.getPractClassesHours());
        dst.setIndependentWorkHours(src.getIndependentWorkHours());
        dst.setPrerequisitesDescription(src.getPrerequisitesDescription());
        dst.setGoal(src.getGoal());
        dst.setAnnotation(src.getAnnotation());
        dst.setAssessmentForm(src.getAssessmentForm());
        dst.setLanguage(src.getLanguage());
        dst.setCreatedAt(LocalDateTime.now());
        dst.setUpdatedAt(null);
        dst.setCreatedBy(src.getUpdatedBy() != null ? src.getUpdatedBy() : src.getCreatedBy());
        dst.setUpdatedBy(null);
        return dst;
    }

    private void cloneChildren(CourseInfo src, CourseInfo dst) {
        clonePrerequisites(src, dst);
        Map<Integer, CourseContent> contentMap = cloneCourseContent(src, dst);
        cloneCalendar(src, dst, contentMap);
        cloneAssessmentDistribution(src, dst);
        cloneSelfStudyDistribution(src, dst);
        cloneLiterature(src, dst);
        cloneProgrammeLinks(src, dst);
    }

    private void clonePrerequisites(CourseInfo src, CourseInfo dst) {
        for (CoursePrerequisites p : prerequisitesRepo.findByCourseInfo(src)) {
            CoursePrerequisites copy = new CoursePrerequisites();
            copy.setCourseInfo(dst);
            copy.setRequiredCourse(p.getRequiredCourse());
            copy.setType(p.getType());
            prerequisitesRepo.save(copy);
        }
    }

    private Map<Integer, CourseContent> cloneCourseContent(CourseInfo src, CourseInfo dst) {
        Map<Integer, CourseContent> map = new HashMap<>();
        for (CourseContent c : courseContentRepo.findByCourseInfoOrderBySequenceNumberAsc(src)) {
            CourseContent copy = new CourseContent();
            copy.setCourseInfo(dst);
            copy.setSequenceNumber(c.getSequenceNumber());
            copy.setTopicTitle(c.getTopicTitle());
            copy.setTopicDescription(c.getTopicDescription());
            copy.setLanguage(c.getLanguage());
            copy.setCreatedAt(LocalDateTime.now());
            copy.setUpdatedAt(null);
            copy.setCreatedBy(c.getUpdatedBy() != null ? c.getUpdatedBy() : c.getCreatedBy());
            copy.setUpdatedBy(null);
            CourseContent saved = courseContentRepo.save(copy);
            map.put(c.getId(), saved);
        }
        return map;
    }

    private void cloneCalendar(CourseInfo src, CourseInfo dst, Map<Integer, CourseContent> contentMap) {
        for (CalendarTopic topic : calendarTopicRepo.findByCourseInfo(src)) {
            CalendarTopic topicCopy = new CalendarTopic();
            topicCopy.setCourseInfo(dst);
            topicCopy.setSequenceNumber(topic.getSequenceNumber());
            topicCopy.setNote(topic.getNote());
            topicCopy.setLanguage(topic.getLanguage());
            CourseContent remappedContent = topic.getCourseContent() != null
                    ? contentMap.get(topic.getCourseContent().getId())
                    : null;
            topicCopy.setCourseContent(remappedContent);
            CalendarTopic savedTopic = calendarTopicRepo.save(topicCopy);

            for (CalendarSession session : calendarSessionRepo.findByTopic(topic)) {
                CalendarSession sessionCopy = new CalendarSession();
                sessionCopy.setTopic(savedTopic);
                sessionCopy.setSessionType(session.getSessionType());
                sessionCopy.setAcademicHours(session.getAcademicHours());
                sessionCopy.setSequenceNumber(session.getSequenceNumber());
                sessionCopy.setCreatedAt(LocalDateTime.now());
                sessionCopy.setUpdatedAt(null);
                calendarSessionRepo.save(sessionCopy);
            }
        }
    }

    private void cloneAssessmentDistribution(CourseInfo src, CourseInfo dst) {
        List<CourseAssessmentDistribution> rows =
                assessmentDistRepo.findByCourseInfoIdOrderByDisplayOrderAscIdAsc(src.getId());
        for (CourseAssessmentDistribution row : rows) {
            CourseAssessmentDistribution copy = new CourseAssessmentDistribution();
            copy.setCourseInfo(dst);
            copy.setComponent(row.getComponent());
            copy.setPercentage(row.getPercentage());
            copy.setDisplayOrder(row.getDisplayOrder());
            copy.setCreatedAt(LocalDateTime.now());
            copy.setUpdatedAt(null);
            copy.setCreatedBy(row.getUpdatedBy() != null ? row.getUpdatedBy() : row.getCreatedBy());
            copy.setUpdatedBy(null);
            assessmentDistRepo.save(copy);
        }
    }

    private void cloneSelfStudyDistribution(CourseInfo src, CourseInfo dst) {
        for (CourseSelfStudyDistribution row : selfStudyDistRepo.findByCourseInfoOrderByDisplayOrderAscIdAsc(src)) {
            CourseSelfStudyDistribution copy = new CourseSelfStudyDistribution();
            copy.setCourseInfo(dst);
            copy.setActivity(row.getActivity());
            copy.setPercentage(row.getPercentage());
            copy.setDisplayOrder(row.getDisplayOrder());
            copy.setCreatedAt(LocalDateTime.now());
            copy.setUpdatedAt(null);
            copy.setCreatedBy(row.getUpdatedBy() != null ? row.getUpdatedBy() : row.getCreatedBy());
            copy.setUpdatedBy(null);
            selfStudyDistRepo.save(copy);
        }
    }

    private void cloneLiterature(CourseInfo src, CourseInfo dst) {
        for (LiteratureSource lit : literatureRepo.findByCourseInfo(src)) {
            LiteratureSource copy = new LiteratureSource();
            copy.setCourseInfo(dst);
            copy.setType(lit.getType());
            copy.setCitation(lit.getCitation());
            copy.setUrl(lit.getUrl());
            copy.setLanguage(lit.getLanguage());
            copy.setCreatedAt(LocalDateTime.now());
            copy.setUpdatedAt(null);
            literatureRepo.save(copy);
        }
    }

    private void cloneProgrammeLinks(CourseInfo src, CourseInfo dst) {
        for (CourseToProgrammeResults link : programmeLinkRepo.findByCourseInfoId(src.getId())) {
            CourseToProgrammeResults copy = new CourseToProgrammeResults();
            copy.setCourseInfo(dst);
            copy.setCourseResult(link.getCourseResult());
            copy.setProgrammeResult(link.getProgrammeResult());
            programmeLinkRepo.save(copy);
        }
    }
}
