package lv.venta.coursecatalog.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;
import lv.venta.coursecatalog.model.log.CourseVersionAction;
import lv.venta.coursecatalog.model.log.CourseVersionLog;
import lv.venta.coursecatalog.model.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * F9 — Plakana projekcija žurnāla skatam, kas iekļauj arī saistīto kursa
 * pamatinformāciju (kuru `@JsonBackReference` izslēdz no CourseVersion).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseVersionLogDTO {

    private int id;
    private LocalDateTime createdAt;
    private String comment;

    private String actionCode;
    private String actionLabel;

    private Integer userId;
    private String userName;
    private String userSurname;
    private String userRole;

    private UUID versionId;
    private int versionNumber;

    private UUID courseId;
    private String courseCode;
    private String courseTitleLv;

    public static CourseVersionLogDTO from(CourseVersionLog log) {
        CourseVersionLogDTO dto = new CourseVersionLogDTO();
        dto.id = log.getId();
        dto.createdAt = log.getCreatedAt();
        dto.comment = log.getComment();

        CourseVersionAction a = log.getAction();
        if (a != null) {
            dto.actionCode = a.getCode();
            dto.actionLabel = a.getLabel();
        }

        User u = log.getUser();
        if (u != null) {
            dto.userId = u.getId();
            dto.userName = u.getName();
            dto.userSurname = u.getSurname();
            if (u.getRole() != null) dto.userRole = u.getRole().getRoleName();
        }

        // LAZY proxy var izgāzties, ja saistītā versija ir arhivēta (@SQLRestriction filtrē)
        // vai dzēsta. Žurnāla ieraksts paliek redzams, bet ar tukšiem versijas/kursa laukiem.
        try {
            CourseVersion v = log.getCourseVersion();
            if (v != null) {
                dto.versionId = v.getId();
                dto.versionNumber = v.getVersionNumber();
                Course c = v.getCourse();
                if (c != null) {
                    dto.courseId = c.getId();
                    dto.courseCode = c.getCourseCode();
                    dto.courseTitleLv = c.getTitleLv();
                }
            }
        } catch (Exception ignored) {
            // versija vairs nav pieejama — atstājam tukšus laukus
        }
        return dto;
    }
}
