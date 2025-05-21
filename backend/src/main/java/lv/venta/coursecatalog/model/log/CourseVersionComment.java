package lv.venta.coursecatalog.model.log;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import lv.venta.coursecatalog.model.user.User;
import lv.venta.coursecatalog.model.course.CourseVersion;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Brīvā teksta komentārs pie kursa versijas.
 */
@Entity
@Table(name = "course_version_comments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@ToString
public class CourseVersionComment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_version_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CourseVersion courseVersion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
