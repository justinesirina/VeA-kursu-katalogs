package lv.venta.coursecatalog.initializer;

import lombok.RequiredArgsConstructor;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import lv.venta.coursecatalog.model.program.StudyProgram;
import lv.venta.coursecatalog.model.program.StudyProgramPart;
import lv.venta.coursecatalog.model.support.AcademicYear;
import lv.venta.coursecatalog.model.support.Faculty;
import lv.venta.coursecatalog.model.support.Semester;
import lv.venta.coursecatalog.model.support.VersionStatus;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.repository.course.CourseAuthorRepository;
import lv.venta.coursecatalog.repository.course.CourseRepository;
import lv.venta.coursecatalog.repository.course.CourseTeacherRepository;
import lv.venta.coursecatalog.repository.course.CourseVersionRepository;
import lv.venta.coursecatalog.repository.program.CourseToStudyProgramsRepository;
import lv.venta.coursecatalog.repository.program.StudyProgramPartRepository;
import lv.venta.coursecatalog.repository.program.StudyProgramRepository;
import lv.venta.coursecatalog.repository.support.AcademicYearRepository;
import lv.venta.coursecatalog.repository.support.FacultyRepository;
import lv.venta.coursecatalog.repository.support.SemesterRepository;
import lv.venta.coursecatalog.repository.support.VersionStatusRepository;
import lv.venta.coursecatalog.repository.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * NF4 veiktspējas testēšanas seed.
 *
 * <p>Metode aktivizējas tikai ar Spring profilu {@code nf4}. Droša atkārtotai palaišanai: pārbauda esošos NF4 kursus pirms jaunu pievienošanas, 
 * un ja jau ir {@value #TARGET_COUNT} vai vairāk, nekas netiek mainīts. 
 * Ja ir mazāk, tiek pievienoti trūkstošie, lai kopā būtu {@value #TARGET_COUNT} ar prefiksu {@value #CODE_PREFIX}.
 * {@value #TARGET_COUNT} pievieno fake kursus ar prefiksu {@value #CODE_PREFIX} klonētajā
 * DB, lai izmērītu kataloga endpointa atbildes laiku pie NF4 (Kursu kataloga
 * un kursa detaļu lapas ielāde ≤ 2 s pie 1000 kursiem DB).</p>
 *
 * <p>Veido tikai "skeleta" datus — Course + CourseVersion + autori/docētāji/programmu
 * sasaistes. Nav CourseInfo, kalendārs, literatūra, vērtēšana. Kataloga
 * SQL šīs tabulas neskar, tāpēc to ielāde tikai palēninātu ielādi.</p>
 */
@Component
@Profile("nf4")
@RequiredArgsConstructor
public class Nf4SeedRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(Nf4SeedRunner.class);

    private static final int TARGET_COUNT = 1000;
    private static final String CODE_PREFIX = "NF4-";
    private static final String APPROVED_STATUS_NAME = "Apstiprināts";

    private final CourseRepository courseRepo;
    private final CourseVersionRepository versionRepo;
    private final CourseAuthorRepository authorRepo;
    private final CourseTeacherRepository teacherRepo;
    private final CourseToStudyProgramsRepository programLinkRepo;
    private final FacultyRepository facultyRepo;
    private final AcademicYearRepository yearRepo;
    private final SemesterRepository semesterRepo;
    private final VersionStatusRepository statusRepo;
    private final UserRepository userRepo;
    private final StudyProgramRepository programRepo;
    private final StudyProgramPartRepository programPartRepo;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Set<String> existingNf4Codes = courseRepo.findAll().stream()
                .map(Course::getCourseCode)
                .filter(code -> code != null && code.startsWith(CODE_PREFIX))
                .collect(java.util.stream.Collectors.toSet());

        if (existingNf4Codes.size() >= TARGET_COUNT) {
            log.info("NF4 seed: jau eksistē {} fake kursi (prefikss '{}'), izlaiž.",
                    existingNf4Codes.size(), CODE_PREFIX);
            return;
        }

        List<Faculty> faculties = facultyRepo.findAll();
        List<AcademicYear> years = yearRepo.findAll();
        List<Semester> semesters = semesterRepo.findAll();
        List<StudyProgram> programs = programRepo.findAll();
        List<StudyProgramPart> parts = programPartRepo.findAll();
        List<User> users = userRepo.findAll();
        VersionStatus approved = statusRepo.findByName(APPROVED_STATUS_NAME)
                .orElse(null);

        if (approved == null) {
            log.warn("NF4 seed: DB nav '{}' statusa — pārtraukts.", APPROVED_STATUS_NAME);
            return;
        }
        if (faculties.isEmpty() || years.isEmpty() || semesters.isEmpty() || users.isEmpty()) {
            log.warn("NF4 seed: nepieciešamie lookup dati trūkst (faculties={}, years={},"
                            + " semesters={}, users={}) — pārtraukts.",
                    faculties.size(), years.size(), semesters.size(), users.size());
            return;
        }

        log.info("NF4 seed: sāk veidot {} fake kursus klonētajā DB.", TARGET_COUNT);

        Random rng = new Random(42);
        Set<String> codesInThisRun = new HashSet<>(existingNf4Codes);
        int created = 0;

        for (int i = 1; i <= TARGET_COUNT; i++) {
            String code = String.format("%s%04d", CODE_PREFIX, i);
            if (codesInThisRun.contains(code)) continue;

            Course course = new Course();
            course.setCourseCode(code);
            course.setTitleLv("NF4 testa kurss " + i);
            course.setTitleEn("NF4 test course " + i);
            course.setCredits(2 + rng.nextInt(7));
            course.setActive(true);
            course.setArchived(false);
            course = courseRepo.save(course);

            CourseVersion version = new CourseVersion();
            version.setCourse(course);
            version.setVersionNumber(1);
            version.setStatus(approved);
            version.setActive(true);
            version.setArchived(false);
            version.setFaculty(faculties.get(rng.nextInt(faculties.size())));
            version.setAcademicYear(years.get(rng.nextInt(years.size())));
            version.setSemester(semesters.get(rng.nextInt(semesters.size())));
            version.setApprovalDate(LocalDate.now().minusDays(rng.nextInt(365)));
            version.setDecisionNumber("Nr. NF4/" + i);
            version.setDecisionReference("NF4 seed");
            version = versionRepo.save(version);

            int authorCount = 1 + rng.nextInt(2);
            for (int a = 0; a < authorCount; a++) {
                CourseAuthor ca = new CourseAuthor();
                ca.setCourseVersion(version);
                ca.setUser(users.get(rng.nextInt(users.size())));
                ca.setRole(a == 0 ? "Autors" : "Līdzautors");
                authorRepo.save(ca);
            }

            int teacherCount = 1 + rng.nextInt(2);
            for (int t = 0; t < teacherCount; t++) {
                CourseTeacher ct = new CourseTeacher();
                ct.setCourseVersion(version);
                ct.setUser(users.get(rng.nextInt(users.size())));
                ct.setRole(t == 0 ? "Atbildīgais mācībspēks" : "Mācībspēks");
                teacherRepo.save(ct);
            }

            if (!programs.isEmpty()) {
                int progCount = 1 + rng.nextInt(2);
                for (int p = 0; p < progCount; p++) {
                    CourseToStudyPrograms link = new CourseToStudyPrograms();
                    link.setCourseVersion(version);
                    link.setProgram(programs.get(rng.nextInt(programs.size())));
                    if (!parts.isEmpty()) {
                        link.setProgramPart(parts.get(rng.nextInt(parts.size())));
                    }
                    programLinkRepo.save(link);
                }
            }

            codesInThisRun.add(code);
            created++;

            if (i % 100 == 0) {
                log.info("NF4 seed: izveidoti {} / {} kursi", i, TARGET_COUNT);
            }
        }

        log.info("NF4 seed: pabeigts, izveidoti {} jauni fake kursi.", created);
    }
}
