package lv.venta.coursecatalog.model.log;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Žurnāla ieraksts par konkrētu darbību saistībā ar kursu vai tā versiju.
 *
 * <p>Atbalsta gan kursa līmeņa darbības (create, archive, restore, hard-delete),
 * kur {@code courseVersion} ir null, gan versiju līmeņa darbības (status pārejas,
 * versiju arhivēšana). {@code course} ir vienmēr aizpildīts un kalpo kā galvenais
 * "kuram kursam" identifikators žurnāla skatā.</p>
 */
@Entity
@Table(name = "course_version_log")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseVersionLog implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /**
     * Kurss, uz kuru attiecas šī darbība — vienmēr aizpildīts.
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "courseVersions"})
    private Course course;

    /**
     * Versija, ja darbība ir versijas līmeņa (status pāreja, arhivēšana).
     * Var būt null kursa līmeņa darbībām (kursa izveide/arhivēšana/dzēšana).
     * LAZY, jo CourseVersion ir ar {@code @SQLRestriction("deleted_at IS NULL")} —
     * EAGER fetch izgāztos arhivētu versiju gadījumā.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_version_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CourseVersion courseVersion;

    /**
     * Lietotājs, kas veica darbību. Var būt null, ja darbība notika
     * bez identificēta lietotāja (piem., dev režīmā vai sistēmas hooka rezultātā).
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "action_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CourseVersionAction action;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
