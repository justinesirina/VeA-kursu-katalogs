package lv.venta.coursecatalog.service.course;

import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
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
import java.util.Collection;
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
 *
 * <p>Multi-select filtri tiek apvienoti ar IN klauzu (OR vienas dimensijas
 * iekšienē); dažādās dimensijas tiek apvienotas ar AND.</p>
 */
public final class CourseCatalogSpecifications {

    private CourseCatalogSpecifications() {}

    /**
     * Statusa nosaukums, ko publisks katalogs uzskata par "publiski redzamu".
     */
    public static final String PUBLIC_VISIBLE_STATUS = "Apstiprināts";

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
            } else {
                // Staff redz visus kursus ar jebkādu versiju (arī tikai melnrakstus
                // bez apstiprinātās). Statusa filtrs ir opcionāls.
                addInPredicate(versionPreds, cv.get("status").get("id"), f.getStatusIds());
            }

            addInPredicate(versionPreds, cv.get("faculty").get("id"), f.getFacultyIds());
            addInPredicate(versionPreds, cv.get("academicYear").get("id"), f.getAcademicYearIds());
            addInPredicate(versionPreds, cv.get("semester").get("id"), f.getSemesterIds());

            if (notEmpty(f.getAuthorUserIds())) {
                Subquery<Integer> aSq = query.subquery(Integer.class);
                Root<CourseAuthor> ca = aSq.from(CourseAuthor.class);
                aSq.select(ca.get("id")).where(
                        cb.equal(ca.get("courseVersion"), cv),
                        ca.get("user").get("id").in(f.getAuthorUserIds())
                );
                versionPreds.add(cb.exists(aSq));
            }
            if (notEmpty(f.getTeacherUserIds())) {
                Subquery<Integer> tSq = query.subquery(Integer.class);
                Root<CourseTeacher> ct = tSq.from(CourseTeacher.class);
                tSq.select(ct.get("id")).where(
                        cb.equal(ct.get("courseVersion"), cv),
                        ct.get("user").get("id").in(f.getTeacherUserIds())
                );
                versionPreds.add(cb.exists(tSq));
            }

            boolean wantsProgramFilter = notEmpty(f.getProgramIds())
                    || notEmpty(f.getProgramPartIds());
            if (wantsProgramFilter) {
                Subquery<Integer> pSq = query.subquery(Integer.class);
                Root<CourseToStudyPrograms> ctsp = pSq.from(CourseToStudyPrograms.class);
                List<Predicate> pp = new ArrayList<>();
                pp.add(cb.equal(ctsp.get("courseVersion"), cv));
                if (notEmpty(f.getProgramIds())) {
                    pp.add(ctsp.get("program").get("id").in(f.getProgramIds()));
                }
                if (notEmpty(f.getProgramPartIds())) {
                    pp.add(ctsp.get("programPart").get("id").in(f.getProgramPartIds()));
                }
                pSq.select(ctsp.get("id")).where(pp.toArray(new Predicate[0]));
                versionPreds.add(cb.exists(pSq));
            }

            sq.where(versionPreds.toArray(new Predicate[0]));
            outer.add(cb.exists(sq));

            return cb.and(outer.toArray(new Predicate[0]));
        };
    }

    private static boolean notEmpty(Collection<?> c) {
        return c != null && !c.isEmpty();
    }

    private static void addInPredicate(List<Predicate> preds, Path<?> path, Collection<?> values) {
        if (notEmpty(values)) {
            preds.add(path.in(values));
        }
    }
}
