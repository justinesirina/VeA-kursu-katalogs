package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Plakana projekcija arhivētajiem kursiem ar agregētu versiju informāciju
 * (cik versijas; jaunākās versijas Nr. un statuss). Ļauj administratoriem
 * arhīva sarakstā ātri izsekot kursa "lielumam" un pēdējam stāvoklim
 * pirms arhivēšanas.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchivedCourseDTO {

    private UUID id;
    private String courseCode;
    private String titleLv;
    private String titleEn;
    private int credits;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;

    private int versionCount;
    private Integer latestVersionNumber;
    private String latestVersionStatus;

    public static ArchivedCourseDTO from(Course c, List<CourseVersion> versions) {
        ArchivedCourseDTO dto = new ArchivedCourseDTO();
        dto.id = c.getId();
        dto.courseCode = c.getCourseCode();
        dto.titleLv = c.getTitleLv();
        dto.titleEn = c.getTitleEn();
        dto.credits = c.getCredits();
        dto.deletedAt = c.getDeletedAt();
        dto.createdAt = c.getCreatedAt();

        dto.versionCount = versions != null ? versions.size() : 0;
        if (versions != null && !versions.isEmpty()) {
            CourseVersion latest = versions.stream()
                    .max((a, b) -> Integer.compare(a.getVersionNumber(), b.getVersionNumber()))
                    .orElse(null);
            if (latest != null) {
                dto.latestVersionNumber = latest.getVersionNumber();
                dto.latestVersionStatus = latest.getStatus() != null ? latest.getStatus().getName() : null;
            }
        }
        return dto;
    }
}
