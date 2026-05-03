package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Plakana projekcija arhivētajām versijām, kas iekļauj saistītā kursa pamatdatus
 * (CourseVersion.course ir ar `@JsonBackReference`, kas tos izslēgtu no JSON).
 *
 * Saglabā lauku struktūru, ko sagaida frontend ArchivedVersionsTable: course.courseCode,
 * course.titleLv, status.name, academicYear.name, semester.name.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivedVersionDTO {

    private UUID id;
    private int versionNumber;
    private LocalDateTime deletedAt;
    private boolean active;

    private CourseRef course;
    private NameRef status;
    private NameRef academicYear;
    private NameRef semester;

    public static ArchivedVersionDTO from(CourseVersion v) {
        ArchivedVersionDTO dto = new ArchivedVersionDTO();
        dto.id = v.getId();
        dto.versionNumber = v.getVersionNumber();
        dto.deletedAt = v.getDeletedAt();
        dto.active = v.isActive();

        Course c = v.getCourse();
        if (c != null) {
            dto.course = new CourseRef(c.getId(), c.getCourseCode(), c.getTitleLv(), c.getTitleEn());
        }
        if (v.getStatus() != null) dto.status = new NameRef(v.getStatus().getName());
        if (v.getAcademicYear() != null) dto.academicYear = new NameRef(v.getAcademicYear().getName());
        if (v.getSemester() != null) dto.semester = new NameRef(v.getSemester().getName());
        return dto;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseRef {
        private UUID id;
        private String courseCode;
        private String titleLv;
        private String titleEn;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NameRef {
        private String name;
    }
}
