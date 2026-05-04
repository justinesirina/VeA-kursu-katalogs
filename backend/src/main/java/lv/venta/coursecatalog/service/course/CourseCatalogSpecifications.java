package lv.venta.coursecatalog.service.course;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseAuthor;
import lv.venta.coursecatalog.model.course.CourseTeacher;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.program.CourseToStudyPrograms;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * F5 — kataloga filtru kompozīcija ar Spring Data JPA Specification API.
 *
 * <p>Filtrs vienmēr paredz Course root un EXISTS subquery uz CourseVersion,
 * lai lapu izkārtojums strādātu uz Course līmeņa bez DISTINCT vajadzības.
 * Subquery iekļauj visus filtru lokālos nosacījumus, lai filtru kombinācija
 * tiek piemērota tieši aktīvajai/atbilstošajai versijai (nav iespējams, ka
 * kurss tiek atgriezts, ja viens filtrs atbilst vienai versijai un cits —
 * citai).</p>
 */
public final class CourseCatalogSpecifications {

    private CourseCatalogSpecifications() {}

    /**
     * Statusa nosaukums, ko publisks katalogs uzskata par "publiski redzamu".
     */
    public static final String PUBLIC_VISIBLE_STATUS = "Apstiprināts";

    /**
     * Substring, ko C-Brīvās izvēles ātrais filtrs meklē StudyProgramPart.name laukā.
     * Lower-cased; saskaņots ar reālajiem datiem ("C - Brīvās izvēles", "Brīvās
     * izvēles" u.c. variācijām).
     */
    public static final String FREE_ELECTIVE_NAME_FRAGMENT = "brīvās izvēles";

    public static Specification<Course> withFilters(CourseCatalogFilter f, boolean staffMode) {
        return (root, query, cb) -> {
            List<Predicate> outer = new ArrayList<>();
            outer.add(cb.isNull(root.get("deletedAt")));
            outer.add(cb.isTrue(root.get("active")));

            if (f.getQ() != null && !f.getQ().isBlank()) {
                String pattern = "%" + f.getQ().toLowerCase().trim() + "%";
                Predicate matchTitleLv = cb.like(cb.lower(root.<String>get("titleLv")), pattern);
                Predicate matchTitleEn = cb.like(cb.lower(root.<String>get("titleEn")), pattern);
                Predicate matchCode = cb.like(
                        cb.lower(cb.coalesce(root.<String>get("courseCode"), "")),
                        pattern
                );
                outer.add(cb.or(matchTitleLv, matchTitleEn, matchCode));
            }

            Subquery<UUID> sq = query.subquery(UUID.class);
            Root<CourseVersion> cv = sq.from(CourseVersion.class);
            sq.select(cv.get("id"));

            List<Predicate> versionPreds = new ArrayList<>();
            versionPreds.add(cb.equal(cv.get("course"), root));
            versionPreds.add(cb.isNull(cv.get("deletedAt")));

            if (!staffMode) {
                versionPreds.add(cb.isTrue(cv.get("isActive")));
                versionPreds.add(cb.equal(
                        cv.join("status", JoinType.INNER).get("name"),
                        PUBLIC_VISIBLE_STATUS
                ));
            } else if (f.getStatusId() != null) {
                versionPreds.add(cb.equal(cv.get("status").get("id"), f.getStatusId()));
            }

            if (f.getFacultyId() != null) {
                versionPreds.add(cb.equal(cv.get("faculty").get("id"), f.getFacultyId()));
            }
            if (f.getAcademicYearId() != null) {
                versionPreds.add(cb.equal(cv.get("academicYear").get("id"), f.getAcademicYearId()));
            }
            if (f.getSemesterId() != null) {
                versionPreds.add(cb.equal(cv.get("semester").get("id"), f.getSemesterId()));
            }

            if (f.getAuthorUserId() != null) {
                Subquery<Integer> aSq = query.subquery(Integer.class);
                Root<CourseAuthor> ca = aSq.from(CourseAuthor.class);
                aSq.select(ca.get("id")).where(
                        cb.equal(ca.get("courseVersion"), cv),
                        cb.equal(ca.get("user").get("id"), f.getAuthorUserId())
                );
                versionPreds.add(cb.exists(aSq));
            }
            if (f.getTeacherUserId() != null) {
                Subquery<Integer> tSq = query.subquery(Integer.class);
                Root<CourseTeacher> ct = tSq.from(CourseTeacher.class);
                tSq.select(ct.get("id")).where(
                        cb.equal(ct.get("courseVersion"), cv),
                        cb.equal(ct.get("user").get("id"), f.getTeacherUserId())
                );
                versionPreds.add(cb.exists(tSq));
            }

            boolean wantsProgramFilter = f.getProgramId() != null
                    || f.getProgramPartId() != null
                    || Boolean.TRUE.equals(f.getFreeElectiveOnly());
            if (wantsProgramFilter) {
                Subquery<Integer> pSq = query.subquery(Integer.class);
                Root<CourseToStudyPrograms> ctsp = pSq.from(CourseToStudyPrograms.class);
                List<Predicate> pp = new ArrayList<>();
                pp.add(cb.equal(ctsp.get("courseVersion"), cv));
                if (f.getProgramId() != null) {
                    pp.add(cb.equal(ctsp.get("program").get("id"), f.getProgramId()));
                }
                if (f.getProgramPartId() != null) {
                    pp.add(cb.equal(ctsp.get("programPart").get("id"), f.getProgramPartId()));
                }
                if (Boolean.TRUE.equals(f.getFreeElectiveOnly())) {
                    pp.add(cb.like(
                            cb.lower(ctsp.get("programPart").<String>get("name")),
                            "%" + FREE_ELECTIVE_NAME_FRAGMENT + "%"
                    ));
                }
                pSq.select(ctsp.get("id")).where(pp.toArray(new Predicate[0]));
                versionPreds.add(cb.exists(pSq));
            }

            sq.where(versionPreds.toArray(new Predicate[0]));
            outer.add(cb.exists(sq));

            return cb.and(outer.toArray(new Predicate[0]));
        };
    }
}
