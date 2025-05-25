package lv.venta.coursecatalog.service.courseinfo;

import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.courseinfo.CourseInfo;
import lv.venta.coursecatalog.model.dto.*;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseTeacherRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.courseinfo.*;
import lv.venta.coursecatalog.repository.program.CourseToStudyProgramsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CourseInfoService {

    @Autowired
    private CourseInfoRepository infoRepo;

    @Autowired
    private CourseRepository courseRepo;

    @Autowired
    private CourseVersionRepository versionRepo;

    @Autowired
    private CoursePrerequisitesRepository coursePrereqRepo;

    @Autowired
    private CourseToStudyProgramsRepository courseToProgramRepo;

    @Autowired
    private CourseAuthorRepository courseAuthorRepo;

    @Autowired
    private CourseTeacherRepository courseTeacherRepo;

    @Autowired
    private CourseAssessmentDistributionRepository courseAssessmentRepo;

    @Autowired
    private CourseResultRepository courseResultRepo;

    @Autowired
    private CourseResultAssessmentRepository courseResultAssessmentRepo;

    @Autowired
    private CourseSelfStudyDistributionRepository courseSelfStudyDistributionRepo;

    @Autowired
    private CourseContentRepository contentRepo;

    @Autowired
    private CalendarTopicRepository calendarTopicRepo;

    @Autowired
    private CalendarSessionRepository calendarSessionRepo;

    @Autowired
    private LiteratureSourceRepository literatureRepo;

    /**
     * Iegūst visus CourseInfo ierakstus.
     */
    public List<CourseInfo> getAll() {
        return infoRepo.findAll();
    }

    /**
     * Iegūst vienu ierakstu pēc tā UUID.
     * @param id CourseInfo UUID
     * @return atrastais ieraksts
     * @throws RuntimeException ja nav atrasts
     */
    public CourseInfo getById(UUID id) {
        return infoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Nav atrasts CourseInfo ar id = " + id));
    }

    /**
     * Izveido jaunu CourseInfo ierakstu.
     */
    @Transactional
    public CourseInfo create(CourseInfo courseInfo) {
        return infoRepo.save(courseInfo);
    }

    /**
     * Atjauno esošu CourseInfo ierakstu pēc ID.
     */
    @Transactional
    public CourseInfo update(UUID id, CourseInfo updated) {
        CourseInfo existing = getById(id);
        existing.setAcademicHoursTotal(updated.getAcademicHoursTotal());
        existing.setLectureHours(updated.getLectureHours());
        existing.setPractClassesHours(updated.getPractClassesHours());
        existing.setIndependentWorkHours(updated.getIndependentWorkHours());
        existing.setPrerequisitesDescription(updated.getPrerequisitesDescription());
        existing.setGoal(updated.getGoal());
        existing.setAnnotation(updated.getAnnotation());
        existing.setAssessmentForm(updated.getAssessmentForm());
        existing.setLanguage(updated.getLanguage());
        existing.setUpdatedAt(updated.getUpdatedAt());
        existing.setUpdatedBy(updated.getUpdatedBy());
        return infoRepo.save(existing);
    }

    /**
     * Dzēš CourseInfo ierakstu pēc ID.
     */
    @Transactional
    public void delete(UUID id) {
        if (!infoRepo.existsById(id)) {
            throw new RuntimeException("Nav atrasts dzēšamais CourseInfo ar id = " + id);
        }
        infoRepo.deleteById(id);
    }

    /**
     * Izveido sākotnējo CourseDetailsDTO ar pamatinformāciju par kursu, versiju un saturu.
     */
    public CourseDetailsDTO getCourseDetailsById(UUID courseId) {
        Optional<Course> courseOpt = courseRepo.findById(courseId);
        if (courseOpt.isEmpty()) return null;
        Course course = courseOpt.get();

        CourseVersion version = versionRepo.findTopByCourseAndIsActiveTrueOrderByVersionNumberDesc(course)
                .orElse(null);
        if (version == null) return null;

        CourseInfo info = infoRepo.findByCourseAndCourseVersion(course, version)
                .orElse(null);
        if (info == null) return null;

        CourseDetailsDTO dto = new CourseDetailsDTO();

        dto.setVersionStatus(version.getStatus().getName());
        if (version.getApprovalDate() != null)
            dto.setApprovalDate(version.getApprovalDate().toString());
        if (version.getDecisionNumber() != null)
            dto.setDecisionNumber(version.getDecisionNumber());
        if (version.getDecisionReference() != null)
            dto.setDecisionReference(version.getDecisionReference());

        // --- Pamatinformācija par kursu ---
        dto.setTitleLv(course.getTitleLv());
        dto.setTitleEn(course.getTitleEn());
        dto.setCourseCode(course.getCourseCode());
        dto.setCredits(course.getCredits());

        dto.setAssessmentForm(info.getAssessmentForm() != null ? info.getAssessmentForm().getName() : null);
        dto.setAcademicHoursTotal(info.getAcademicHoursTotal());
        dto.setLectureHours(info.getLectureHours());
        dto.setPractClassesHours(info.getPractClassesHours());

        dto.setAcademicYear(version.getAcademicYear().getName());
        dto.setSemester(version.getSemester().getName());
        dto.setLanguage(info.getLanguage());

        dto.setFacultyName(version.getFaculty() != null ? version.getFaculty().getName() : null);

        // --- Autora (docētāja) vārds ar grādu un amatu ---
        String authorName = null;

        List<CourseAuthor> authors = courseAuthorRepo.findByCourseId(course.getId());

        if (!authors.isEmpty()) {
            var user = authors.get(0).getUser();
            authorName = user.getAcademicDegree() + ", " + user.getPosition() + " " +
                    user.getName() + " " + user.getSurname();
        } else {
            List<CourseTeacher> teachers = courseTeacherRepo.findByCourseId(course.getId());
            if (!teachers.isEmpty()) {
                var user = teachers.get(0).getUser();
                authorName = user.getAcademicDegree() + ", " + user.getPosition() + " " +
                        user.getName() + " " + user.getSurname();
            }
        }
        dto.setAuthorFullTitle(authorName);

        // --- Studiju kursa priekšnosacījumi ---
        List<PrerequisiteDTO> prereqDtos = new ArrayList <>();
        coursePrereqRepo.findByCourseInfo(info).forEach(prereq -> {
            String title = prereq.getRequiredCourse().getTitleLv();
            String type = prereq.getType(); // sagaidām “obligāts” vai “ieteicams”
            prereqDtos.add(new PrerequisiteDTO(title, type));
        });
        dto.setPrerequisites(prereqDtos);

        dto.setPrerequisitesDescription(info.getPrerequisitesDescription());

        // --- Piesaistītā studiju programma ---
        List<String> studyProgramNames = new ArrayList<>();
        courseToProgramRepo.findByCourseId(course.getId()).forEach(link -> {
            studyProgramNames.add(link.getProgram().getName());
        });
        dto.setStudyPrograms(studyProgramNames);

        // --- Vērtēšanas sadalījums ---
        List<AssessmentComponentDTO> assessmentDtos = new ArrayList<>();
        courseAssessmentRepo.findByCourseInfoIdOrderById(info.getId()).forEach(ad -> {
            String component = ad.getComponent().getName();
            int percent = ad.getPercentage();
            assessmentDtos.add(new AssessmentComponentDTO(component, percent));
        });
        dto.setAssessmentDistribution(assessmentDtos);

        // --- Studiju kursa rezultāti (SKR) – CourseResult + studiju programma ---
        List<ResultAssessmentDTO> assessmentCriteriaDtos = new ArrayList<>();

        courseResultRepo.findByCourseId(course.getId()).forEach(cr -> {
            List<String> components = new ArrayList<>();
            courseResultAssessmentRepo.findByCourseResult(cr).forEach(ra -> {
                if (ra.isUsed()) {
                    components.add(ra.getComponent().getName());
                }
            });
            assessmentCriteriaDtos.add(new ResultAssessmentDTO(cr.getLearningOutcome(), components));
        });
        dto.setResultAssessments(assessmentCriteriaDtos);

        // --- Patstāvīgā darba aktivitātes ar % sadalījumu ---
        List<SelfStudyDTO> selfStudyDtos = new ArrayList<>();
        courseSelfStudyDistributionRepo.findByCourseInfo(info).forEach(ssd -> {
            String activity = ssd.getActivity().getName();
            int percent = ssd.getPercentage();
            selfStudyDtos.add(new SelfStudyDTO(activity, percent));
        });
        dto.setSelfStudyActivities(selfStudyDtos);
        dto.setIndependentWorkHours(info.getIndependentWorkHours());

        // --- Studiju kursa saturs ---
        List<TopicDTO> topicDtos = new ArrayList<>();

        contentRepo.findByCourseInfoOrderBySequenceNumberAsc(info).forEach(content -> {
            TopicDTO topic = new TopicDTO(
                    content.getSequenceNumber(),
                    content.getTopicTitle(),
                    content.getTopicDescription()
            );
            topicDtos.add(topic);
        });

        dto.setTopics(topicDtos);

        // --- Studiju kursa kalendārais plāns ---
        List<CalendarPlanDTO> calendarPlanDtos = new ArrayList<>();

        calendarTopicRepo.findByCourseInfo(info).forEach(topic -> {
            List<SessionDTO> sessionDtos = new ArrayList<>();

            calendarSessionRepo.findByTopic(topic).forEach(session -> {
                String type = session.getSessionType().getName();
                int hours = session.getAcademicHours();
                sessionDtos.add(new SessionDTO(type, hours));
            });

            CalendarPlanDTO plan = new CalendarPlanDTO(topic.getCourseContent().getTopicTitle(), sessionDtos);
            calendarPlanDtos.add(plan);
        });

        dto.setCalendarPlan(calendarPlanDtos);

        // --- Studiju kursa literatūra ---
        Map<String, List<LiteratureDTO>> grouped = new HashMap<>();

        literatureRepo.findByCourseInfo(info).forEach(source -> {
            String type = source.getType().getName(); // piemēram: “Pamatliteratūra”

            grouped.putIfAbsent(type, new ArrayList<>());

            grouped.get(type).add(new LiteratureDTO(
                    source.getCitation(),
                    source.getUrl()
            ));
        });

        List<LiteratureGroupDTO> literature = grouped.entrySet().stream()
                .map(entry -> new LiteratureGroupDTO(entry.getKey(), entry.getValue()))
                .toList();

        dto.setLiterature(literature);

        return dto;
    }
}
