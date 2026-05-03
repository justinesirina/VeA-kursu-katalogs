package lv.venta.coursecatalog.model.log;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Žurnāla ieraksts par konkrētu darbību ar kursa versiju.
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

    // courseVersion paliek LAZY, jo CourseVersion entītijai ir @SQLRestriction("deleted_at IS NULL");
    // EAGER fetch izgāztos, kad žurnāla ieraksts norāda uz arhivētu (soft-deleted) versiju.
    // DTO mapping handle null/exception gracefully.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_version_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CourseVersion courseVersion;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
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
