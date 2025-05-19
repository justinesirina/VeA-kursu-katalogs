package lv.venta.coursecatalog.model.courseinfo;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lv.venta.coursecatalog.model.course.Course;
import lv.venta.coursecatalog.model.user.User;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"course"})
@Entity
@Table(name = "course_results")
public class CourseResult {

    @Id
    @GeneratedValue
    private UUID id;

    // Atsauce uz pamata kursu (Course)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Rezultāta kategorija – zināšanas, prasmes, kompetences
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private ResultsCategory category;

    // Valodas kods ('lv' vai 'en')
    @Pattern(regexp = "^(lv|en)$", message = "Valodai jābūt 'lv' vai 'en'")
    @Column(nullable = false)
    private String language;

    // Teksts ar sasniedzamo rezultātu
    @NotBlank(message = "Rezultāts nedrīkst būt tukšs")
    @Column(name = "learning_outcome", nullable = false, columnDefinition = "TEXT")
    private String learningOutcome;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;

    private LocalDateTime deletedAt;
}

